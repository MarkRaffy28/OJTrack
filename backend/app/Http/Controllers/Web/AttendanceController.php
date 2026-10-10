<?php

namespace App\Http\Controllers\Web;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Office;
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

    $query = Attendance::query()
      ->with([
        'student',
        'ojt.office',
        'ojt.supervisor',
      ])
      ->filter($request->only([
        'office_id',
        'student_id',
        'date_range',
      ]))
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
      ini_set('memory_limit', '512M');
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

    return view("shared.attendance.index", [
      "attendances" => $attendances,
      "students" => $students,
      "headers" => $headers,
      "filters" => $filters,
    ]);
  }

  public function show(Attendance $attendance): View {
    Gate::authorize('view', $attendance->student);

    $attendance->load([
      'student',
      'ojt.office',
      'ojt.supervisor',
    ]);

    return view("shared.attendance.show", compact("attendance"));
  }

  public function create(): View {
    Gate::authorize('create', Attendance::class);

    $viewer = Auth::user();

    $students = User::query()
      ->where('role', UserRole::STUDENT->value)
      ->visibleTo($viewer)
      ->orderBy('last_name')
      ->get();

    $studentOjts = StudentOjt::query()
      ->with(['student', 'office', 'supervisor'])
      ->whereHas('student', fn($q) => $q->visibleTo($viewer))
      ->latest()
      ->get();

    return view("shared.attendance.create", compact("students", "studentOjts"));
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

    Gate::authorize('update', $student);

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
    Gate::authorize('update', $attendance->student);

    $viewer = Auth::user();

    $students = User::query()
      ->where('role', UserRole::STUDENT->value)
      ->visibleTo($viewer)
      ->orderBy('last_name')
      ->get();

    $studentOjts = StudentOjt::query()
      ->with(['student', 'office', 'supervisor'])
      ->whereHas('student', fn($q) => $q->visibleTo($viewer))
      ->latest()
      ->get();

    return view("shared.attendance.edit", compact("attendance", "students", "studentOjts"));
  }

  public function update(Request $request, Attendance $attendance) {
    Gate::authorize('update', $attendance->student);

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
    Gate::authorize('update', $attendance->student);

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
    Gate::authorize('update', $attendance->student);

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
    Gate::authorize('delete', $attendance->student);
    $attendance->delete();

    $role = Auth::user()->role->value;

    return redirect()
      ->route("web.{$role}.attendance.index")
      ->with("success", "Attendance record deleted successfully.");
  }
}
