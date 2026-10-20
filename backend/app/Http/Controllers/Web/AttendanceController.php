<?php

namespace App\Http\Controllers\Web;

use App\Enums\UserRole;
use App\Enums\OjtStatus;
use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Office;
use App\Models\StudentDetail;
use App\Models\StudentOjt;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class AttendanceController extends Controller {

  public function index(Request $request): View|Response {
    Gate::authorize('viewAny', Attendance::class);

    $viewer = Auth::user();

    $validated = $request->validate([
      'office_id' => ['sometimes', 'required', 'integer', 'exists:offices,id'],
      'all_offices' => ['sometimes', 'boolean'],
      'program' => ['sometimes', 'required', 'string'],
      'section' => ['sometimes', 'required', 'string'],
      'all_sections' => ['sometimes', 'boolean'],
      'all_reports' => ['sometimes', 'boolean'], // or all_attendances if you prefer, keeping fallback compatibility
    ]);

    $allOffices = $request->boolean('all_offices');
    $allSections = $request->boolean('all_sections');
    $allReports = $request->boolean('all_reports') || $request->boolean('all_attendances');

    // Level 1: Select Office (or All Offices)
    if (!isset($validated['office_id']) && !$allOffices) {
      $officeQuery = Office::query()
        ->orderBy('name')
        ->withCount([
          'attendances as attendances_count' => function ($q) use ($viewer) {
            $this->selectedCohortQuery($q, 'ojt.ojt');
            $q->whereHas('student', fn($sub) => $sub->visibleTo($viewer));
            if ($viewer->isSupervisor()) {
              $q->whereHas('ojt', fn($sub) => $sub->where('supervisor_id', $viewer->id));
            }
          },
        ]);

      $offices = $officeQuery->get()->map(fn($office) => [
        'office' => $office,
        'attendances_count' => $office->attendances_count,
      ]);

      $totalAttendanceQuery = Attendance::query()
        ->tap(fn($q) => $this->selectedCohortQuery($q, 'ojt.ojt'))
        ->whereHas('student', fn($q) => $q->visibleTo($viewer));

      if ($viewer->isSupervisor()) {
        $totalAttendanceQuery->whereHas('ojt', fn($q) => $q->where('supervisor_id', $viewer->id));
      }

      $totalAttendancesCount = $totalAttendanceQuery->count();

      return view('shared.attendance.index', [
        'offices' => $offices,
        'totalAttendancesCount' => $totalAttendancesCount,
      ]);
    }

    // Level 2: Select Section (or All Sections) for the chosen office / all offices
    if (!isset($validated['section']) && !$allSections && !$allReports) {
      $officeId = $validated['office_id'] ?? null;

      // Build a single grouped count query instead of N+1 per-section queries
      $sectionCountQuery = Attendance::query()
        ->tap(fn($q) => $this->selectedCohortQuery($q, 'ojt.ojt'))
        ->join('users as students', 'attendance.student_id', '=', 'students.id')
        ->join('student_details', 'students.id', '=', 'student_details.user_id')
        ->whereHas('student', fn($q) => $q->visibleTo($viewer))
        ->when(!$allOffices && $officeId, fn($q) => $q->whereHas('ojt', fn($sub) => $sub->where('office_id', $officeId)))
        ->when($viewer->isSupervisor(), fn($q) => $q->whereHas('ojt', fn($sub) => $sub->where('supervisor_id', $viewer->id)))
        ->selectRaw('student_details.program, student_details.section, COUNT(attendance.id) as attendances_count')
        ->groupBy('student_details.program', 'student_details.section');

      $sectionCounts = $sectionCountQuery->get()->keyBy(fn($row) => $row->program . '|' . $row->section);

      $sections = StudentDetail::query()
        ->select('program', 'section')
        ->whereNotNull('program')
        ->whereNotNull('section')
        ->distinct()
        ->orderBy('program')
        ->orderBy('section')
        ->get()
        ->map(function ($detail) use ($sectionCounts) {
          $program = $detail->program;
          $section = $detail->section;
          $key = $program . '|' . $section;

          return [
            'program' => $program,
            'section' => $section,
            'label' => "{$program} - {$section}",
            'attendances_count' => $sectionCounts->get($key)?->attendances_count ?? 0,
          ];
        });

      $officeAttendanceQuery = Attendance::query()
        ->tap(fn($q) => $this->selectedCohortQuery($q, 'ojt.ojt'))
        ->whereHas('student', fn($q) => $q->visibleTo($viewer))
        ->when(!$allOffices && $officeId, fn($q) => $q->whereHas('ojt', fn($sub) => $sub->where('office_id', $officeId)));

      if ($viewer->isSupervisor()) {
        $officeAttendanceQuery->whereHas('ojt', fn($q) => $q->where('supervisor_id', $viewer->id));
      }

      $totalOfficeAttendancesCount = $officeAttendanceQuery->count();

      $office = $officeId ? Office::find($officeId) : null;

      // Build breadcrumbs for Level 2
      $breadcrumbs = [
        [
          'label' => 'Attendance',
          'url' => route("web.{$viewer->role->value}.attendance.index"),
        ],
      ];

      if ($allOffices) {
        $breadcrumbs[] = ['label' => 'All Offices', 'url' => null];
      } elseif ($office) {
        $breadcrumbs[] = ['label' => $office->name, 'url' => null];
      }

      return view('shared.attendance.index', [
        'breadcrumbs' => $breadcrumbs,
        'sections' => $sections,
        'office' => $office,
        'allOffices' => $allOffices,
        'totalOfficeAttendancesCount' => $totalOfficeAttendancesCount,
      ]);
    }

    // Level 3: Attendance Table View
    $officeId = $validated['office_id'] ?? null;
    $program = $validated['program'] ?? null;
    $section = $validated['section'] ?? null;

    $query = Attendance::query()
      ->tap(fn($q) => $this->selectedCohortQuery($q, 'ojt.ojt'))
      ->with([
        'student.studentDetail',
        'ojt.office',
        'ojt.supervisor',
      ])
      ->filter($request->only([
        'office_id',
        'student_id',
        'date_range',
      ]))
      ->when(
        !$allOffices && $officeId,
        fn($q) => $q->whereHas('ojt', fn($sub) => $sub->where('office_id', $officeId))
      )
      ->when(
        $program,
        fn($q) => $q->whereHas('student.studentDetail', fn($sub) => $sub->where('program', $program))
      )
      ->when(
        $section,
        fn($q) => $q->whereHas('student.studentDetail', fn($sub) => $sub->where('section', $section))
      )
      ->whereHas('student', fn($q) => $q->visibleTo($viewer))
      ->sort(
        $request->input('sort', 'date'),
        $request->input('direction', 'desc')
      );

    if ($viewer->isSupervisor()) {
      $query->whereHas('ojt', function ($q) use ($viewer) {
        $q->where('supervisor_id', $viewer->id);
      });
    }

    $students = User::query()
      ->where('role', UserRole::STUDENT->value)
      ->visibleTo($viewer)
      ->whereHas('studentOjts', fn($q) => $this->selectedCohortQuery($q))
      ->when(
        !$allOffices && isset($officeId),
        fn($q) => $q->whereHas('studentOjts', fn($sub) => $sub->where('office_id', $officeId))
      )
      ->when(
        isset($program),
        fn($q) => $q->whereHas('studentDetail', fn($sub) => $sub->where('program', $program))
      )
      ->when(
        isset($section),
        fn($q) => $q->whereHas('studentDetail', fn($sub) => $sub->where('section', $section))
      )
      ->orderBy('last_name')
      ->get();

    $headers = [
      ['label' => 'ID', 'key' => 'id'],
      ['label' => 'Student', 'key' => 'student'],
      ['label' => 'Date', 'key' => 'date'],
      'Morning Session',
      'Afternoon Session',
      ['label' => 'Assigned Office', 'key' => 'office'],
      ['label' => 'Supervisor', 'key' => 'supervisor'],
      'Rendered Hours',
      'Attendance Status',
      'Toggle All 4',
      'Actions',
    ];

    $filters = [
      [
        'name' => 'office_id',
        'label' => 'Office',
        'options' => Office::query()
          ->orderBy("name")
          ->get()
          ->map(fn($o) => ['value' => $o->id, 'label' => $o->name])
          ->toArray(),
        'searchable' => true,
      ],
      [
        'name' => 'student_id',
        'label' => 'Student',
        'options' => $students->map(fn($s) => ['value' => $s->id, 'label' => $s->full_name])->toArray(),
        'searchable' => true,
      ],
    ];

    if ($request->boolean('print')) {
      getenv('memory_limit') ?: ini_set('memory_limit', '512M');
      set_time_limit(300);

      $attendances = $query->get();

      return Pdf::loadView('shared.attendance.pdf', [
        'attendances' => $attendances,
      ])
        ->setPaper('a4', 'landscape')
        ->stream('attendance.pdf');
    }

    $attendances = $query
      ->paginate(10)
      ->withQueryString();

    $office = $officeId ? Office::find($officeId) : null;

    // Build breadcrumbs for Level 3
    $breadcrumbs = [
      [
        'label' => 'Attendance',
        'url' => route("web.{$viewer->role->value}.attendance.index"),
      ],
    ];

    if ($allOffices) {
      $breadcrumbs[] = ['label' => 'All Offices', 'url' => route("web.{$viewer->role->value}.attendance.index", ['all_offices' => 1])];
    } elseif ($office) {
      $breadcrumbs[] = [
        'label' => $office->name,
        'url' => route("web.{$viewer->role->value}.attendance.index", ['office_id' => $office->id]),
      ];
    }

    if ($allSections) {
      $breadcrumbs[] = ['label' => 'All Sections', 'url' => null];
    } elseif ($section) {
      $breadcrumbs[] = ['label' => "{$program} - {$section}", 'url' => null];
    }

    return view("shared.attendance.index", [
      "breadcrumbs" => $breadcrumbs,
      "attendances" => $attendances,
      "students" => $students,
      "headers" => $headers,
      "filters" => $filters,
      "office" => $office,
      "currentProgram" => $program,
      "currentSection" => $section,
    ]);
  }

  public function show(Attendance $attendance): View {
    Gate::authorize('view', $attendance);

    $attendance->load([
      'student',
      'ojt.office',
      'ojt.supervisor',
      'ojt.instructor',
    ]);

    return view("shared.attendance.show", compact("attendance"));
  }

  public function create(): View {
    Gate::authorize('create', Attendance::class);

    $viewer = Auth::user();

    $studentOjts = StudentOjt::query()
      ->with(['student', 'office', 'supervisor', 'instructor'])
      ->whereHas('student', fn($q) => $q->visibleTo($viewer))
      ->where('status', '!=', OjtStatus::COMPLETED->value)
      ->whereIn('id', StudentOjt::query()
        ->selectRaw('MAX(id)')
        ->where('status', '!=', OjtStatus::COMPLETED->value)
        ->groupBy('student_id'))
      ->orderBy('id')
      ->get();

    return view("shared.attendance.create", compact("studentOjts"));
  }

  public function store(Request $request) {
    $validated = $request->validate([
      'student_id' => ['required', 'exists:users,id'],
      'ojt_id' => ['required', 'exists:student_ojts,id'],
      'date' => ['required', 'date'],
      'morning_in' => ['nullable'],
      'morning_in_verified' => ['nullable', 'boolean'],
      'morning_out' => ['nullable'],
      'morning_out_verified' => ['nullable', 'boolean'],
      'afternoon_in' => ['nullable'],
      'afternoon_in_verified' => ['nullable', 'boolean'],
      'afternoon_out' => ['nullable'],
      'afternoon_out_verified' => ['nullable', 'boolean'],
    ]);

    $student = User::find($validated['student_id']);

    $studentOjt = StudentOjt::findOrFail($validated['ojt_id']);
    abort_unless((int) $studentOjt->student_id === (int) $validated['student_id'], 422, 'The attendance student does not match the OJT assignment.');
    Gate::authorize('create', [Attendance::class, $studentOjt]);

    if (\Carbon\Carbon::parse($validated['date'])->isWeekend()) {
      return back()
        ->withInput()
        ->withErrors(['date' => 'Attendance can only be recorded on weekdays (Monday to Friday).']);
    }

    $validated['morning_in_verified'] = $request->boolean('morning_in_verified');
    $validated['morning_out_verified'] = $request->boolean('morning_out_verified');
    $validated['afternoon_in_verified'] = $request->boolean('afternoon_in_verified');
    $validated['afternoon_out_verified'] = $request->boolean('afternoon_out_verified');

    Attendance::create($validated);

    $role = Auth::user()->role->value;

    return redirect()
      ->route("web.{$role}.attendance.index")
      ->with("success", "Attendance logged successfully.");
  }

  public function edit(Attendance $attendance): View {
    Gate::authorize('update', $attendance);
    $attendance->load(['student', 'ojt.office', 'ojt.supervisor', 'ojt.instructor']);

    return view("shared.attendance.edit", compact("attendance"));
  }

  public function update(Request $request, Attendance $attendance) {
    Gate::authorize('update', $attendance);

    $validated = $request->validate([
      'date' => ['required', 'date'],
      'morning_in' => ['nullable'],
      'morning_in_verified' => ['nullable', 'boolean'],
      'morning_out' => ['nullable'],
      'morning_out_verified' => ['nullable', 'boolean'],
      'afternoon_in' => ['nullable'],
      'afternoon_in_verified' => ['nullable', 'boolean'],
      'afternoon_out' => ['nullable'],
      'afternoon_out_verified' => ['nullable', 'boolean'],
    ]);

    if (\Carbon\Carbon::parse($validated['date'])->isWeekend()) {
      return back()
        ->withInput()
        ->withErrors(['date' => 'Attendance can only be recorded on weekdays (Monday to Friday).']);
    }

    $validated['morning_in_verified'] = $request->boolean('morning_in_verified');
    $validated['morning_out_verified'] = $request->boolean('morning_out_verified');
    $validated['afternoon_in_verified'] = $request->boolean('afternoon_in_verified');
    $validated['afternoon_out_verified'] = $request->boolean('afternoon_out_verified');

    $attendance->update($validated);

    $role = Auth::user()->role->value;

    return redirect()
      ->route("web.{$role}.attendance.index")
      ->with("success", "Attendance record updated successfully.");
  }

  public function toggleApproval(Request $request, Attendance $attendance) {
    Gate::authorize('override', $attendance);

    $currentlyApproved = $attendance->is_fully_approved;
    $newStatus = !$currentlyApproved;

    $attendance->morning_in_verified = $newStatus;
    $attendance->morning_out_verified = $newStatus;
    $attendance->afternoon_in_verified = $newStatus;
    $attendance->afternoon_out_verified = $newStatus;

    $attendance->save();

    $statusMsg = $newStatus ? 'approved' : 'unapproved';
    $dateStr = $attendance->date ? $attendance->date->format('M d, Y') : 'selected date';

    return back()->with('success', "All 4 attendance slots for {$dateStr} marked as {$statusMsg}.");
  }

  public function toggleSlot(Request $request, Attendance $attendance, string $slot) {
    Gate::authorize('override', $attendance);

    $validSlots = [
      'morning_in' => 'morning_in_verified',
      'morning_out' => 'morning_out_verified',
      'afternoon_in' => 'afternoon_in_verified',
      'afternoon_out' => 'afternoon_out_verified',
    ];

    if (!array_key_exists($slot, $validSlots)) {
      return back()->with('error', 'Invalid attendance slot.');
    }

    if (!$attendance->{$slot}) {
      return back()->with('error', 'Cannot toggle approval for a slot without a logged time.');
    }

    $field = $validSlots[$slot];
    $attendance->{$field} = !$attendance->{$field};
    $attendance->save();

    $state = $attendance->{$field} ? 'approved' : 'unapproved';
    $label = str_replace('_', ' ', $slot);

    return back()->with('success', "Slot '{$label}' marked as {$state}.");
  }

  public function destroy(Attendance $attendance) {
    Gate::authorize('delete', $attendance);
    $attendance->delete();

    $role = Auth::user()->role->value;

    return redirect()
      ->route("web.{$role}.attendance.index")
      ->with("success", "Attendance record deleted successfully.");
  }
}
