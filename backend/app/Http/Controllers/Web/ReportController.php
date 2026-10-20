<?php

namespace App\Http\Controllers\Web;

use App\Enums\ReportStatus;
use App\Enums\ReportType;
use App\Enums\OjtStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\ReportRequest;
use App\Models\Office;
use App\Models\Report;
use App\Models\ReportAssignment;
use App\Models\StudentDetail;
use App\Models\StudentOjt;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class ReportController extends Controller {

  public function index(Request $request): View|Response {
    Gate::authorize('viewAny', Report::class);

    $viewer = Auth::user();

    $validated = $request->validate([
      'office_id' => ['sometimes', 'required', 'integer', 'exists:offices,id'],
      'all_offices' => ['sometimes', 'boolean'],
      'program' => ['sometimes', 'required', 'string'],
      'section' => ['sometimes', 'required', 'string'],
      'all_sections' => ['sometimes', 'boolean'],
      'all_reports' => ['sometimes', 'boolean'],
    ]);

    $allOffices = $request->boolean('all_offices');
    $allSections = $request->boolean('all_sections');
    $allReports = $request->boolean('all_reports');

    // Level 1: Select Office (or All Offices)
    if (!isset($validated['office_id']) && !$allOffices) {
      $offices = Office::query()
        ->orderBy('name')
        ->withCount([
          'reports as reports_count' => function ($q) use ($viewer) {
            $this->selectedCohortQuery($q, 'ojt.ojt');
            $q->whereHas('student', fn($sub) => $sub->visibleTo($viewer));
          },
        ])
        ->get()
        ->map(fn($office) => [
          'office' => $office,
          'reports_count' => $office->reports_count,
        ]);

      $totalReportsCount = Report::query()
        ->tap(fn($q) => $this->selectedCohortQuery($q, 'ojt.ojt'))
        ->whereHas('student', fn($q) => $q->visibleTo($viewer))
        ->count();

      return view('shared.reports.index', [
        'offices' => $offices,
        'totalReportsCount' => $totalReportsCount,
      ]);
    }

    // Level 2: Select Section (or All Sections) for the chosen office / all offices
    if (!isset($validated['section']) && !$allSections && !$allReports) {
      $officeId = $validated['office_id'] ?? null;

      // Single grouped count query instead of N+1 per-section queries
      $sectionCounts = Report::query()
        // This query returns aggregate rows, not complete Report models. The
        // Report model's default eager loads expect columns such as
        // student_id, which are intentionally absent from this select.
        ->withoutEagerLoads()
        ->tap(fn($q) => $this->selectedCohortQuery($q, 'ojt.ojt'))
        ->join('users as students', 'reports.student_id', '=', 'students.id')
        ->join('student_details', 'students.id', '=', 'student_details.user_id')
        ->whereHas('student', fn($q) => $q->visibleTo($viewer))
        ->when(!$allOffices && $officeId, fn($q) => $q->whereHas('ojt', fn($sub) => $sub->where('office_id', $officeId)))
        ->selectRaw('student_details.program, student_details.section, COUNT(reports.id) as reports_count')
        ->groupBy('student_details.program', 'student_details.section')
        ->get()
        ->keyBy(fn($row) => $row->program . '|' . $row->section);

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
            'reports_count' => $sectionCounts->get($key)?->reports_count ?? 0,
          ];
        });

      $totalOfficeReportsCount = Report::query()
        ->tap(fn($q) => $this->selectedCohortQuery($q, 'ojt.ojt'))
        ->whereHas('student', fn($q) => $q->visibleTo($viewer))
        ->when(!$allOffices && $officeId, fn($q) => $q->whereHas('ojt', fn($sub) => $sub->where('office_id', $officeId)))
        ->count();

      $office = $officeId ? Office::find($officeId) : null;

      $breadcrumbs = [
        [
          'label' => 'Reports',
          'url' => route("web.{$viewer->role->value}.reports.index"),
        ],
      ];

      if ($allOffices) {
        $breadcrumbs[] = ['label' => 'All Offices', 'url' => null];
      } elseif ($office) {
        $breadcrumbs[] = ['label' => $office->name, 'url' => null];
      }

      return view('shared.reports.index', [
        'breadcrumbs' => $breadcrumbs,
        'sections' => $sections,
        'office' => $office,
        'allOffices' => $allOffices,
        'totalOfficeReportsCount' => $totalOfficeReportsCount,
      ]);
    }

    // Level 3: Reports Table View
    $officeId = $validated['office_id'] ?? null;
    $program = $validated['program'] ?? null;
    $section = $validated['section'] ?? null;

    $query = Report::query()
      ->withTrashed()
      ->tap(fn($q) => $this->selectedCohortQuery($q, 'ojt.ojt'))
      ->with([
        'student.studentDetail',
        'ojt.office',
        'reviewer',
        'reportAssignment',
      ])
      ->filter($request->only([
        'student_id',
        'office_id',
        'type',
        'status',
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
        $request->input('sort', 'id'),
        $request->input('direction', 'desc')
      );

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
      ['label' => 'Office', 'key' => 'office'],
      ['label' => 'Type', 'key' => 'type'],
      ['label' => 'Report Date', 'key' => 'report_date'],
      'Deadline',
      ['label' => 'Status', 'key' => 'status'],
      ['label' => 'Reviewed By', 'key' => 'reviewer'],
      'Actions',
    ];

    $filters = [
      [
        'name' => 'student_id',
        'label' => 'Student',
        'options' => $students->map(fn($student) => [
          'value' => $student->id,
          'label' => $student->full_name,
        ])->toArray(),
        'searchable' => true,
      ],
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
        'name' => 'type',
        'label' => 'Type',
        'options' => ReportType::options(),
      ],
      [
        'name' => 'status',
        'label' => 'Status',
        'options' => ReportStatus::options(),
      ],
    ];

    if ($request->boolean('print')) {
      getenv('memory_limit') ?: ini_set('memory_limit', '512M');
      set_time_limit(300);

      $reports = $query->get();

      return Pdf::loadView('shared.reports.pdf', [
        'reports' => $reports,
      ])
        ->setPaper('a4', 'landscape')
        ->stream('reports.pdf');
    }

    $reports = $query
      ->paginate(10)
      ->withQueryString();

    $office = $officeId ? Office::find($officeId) : null;

    $breadcrumbs = [
      [
        'label' => 'Reports',
        'url' => route("web.{$viewer->role->value}.reports.index"),
      ],
    ];

    if ($allOffices) {
      $breadcrumbs[] = ['label' => 'All Offices', 'url' => route("web.{$viewer->role->value}.reports.index", ['all_offices' => 1])];
    } elseif ($office) {
      $breadcrumbs[] = [
        'label' => $office->name,
        'url' => route("web.{$viewer->role->value}.reports.index", ['office_id' => $office->id]),
      ];
    }

    if ($allSections) {
      $breadcrumbs[] = ['label' => 'All Sections', 'url' => null];
    } elseif ($section) {
      $breadcrumbs[] = ['label' => "{$program} - {$section}", 'url' => null];
    }

    return view('shared.reports.index', [
      'breadcrumbs' => $breadcrumbs,
      'reports' => $reports,
      'headers' => $headers,
      'filters' => $filters,
      'currentOffice' => $office,
      'currentProgram' => $program,
      'currentSection' => $section,
    ]);
  }

  public function create(): View {
    Gate::authorize('create', Report::class);

    $viewer = Auth::user();

    $studentOjts = StudentOjt::query()
      ->with(['student', 'ojt'])
      ->whereIn('status', [OjtStatus::PENDING->value, OjtStatus::ONGOING->value])
      ->whereHas('student', fn($q) => $q->visibleTo($viewer))
      ->latest('created_at')->latest('id')
      ->get();

    // A student may have multiple OJT records. Reports are submitted against
    // the latest active record, so the form never needs to expose that choice.
    $studentOjts = $studentOjts->groupBy('student_id')->map->first()->values();
    $students = User::query()
      ->where("role", UserRole::STUDENT->value)
      ->whereIn('id', $studentOjts->pluck('student_id'))
      ->visibleTo($viewer)
      ->orderBy("last_name")
      ->get();

    $assignments = ReportAssignment::query()
      ->whereIn('ojt_id', $studentOjts->pluck('id'))
      ->whereNotNull('published_at')->where('published_at', '<=', now())
      ->with('reports')->get()->groupBy('ojt_id');

    $reportTypeOptionsByStudent = $studentOjts->groupBy('student_id')->map(fn($ojts) =>
      $ojts->flatMap(fn($ojt) => ($assignments->get($ojt->id) ?? collect())
        ->filter(fn($assignment) => !$assignment->reports->contains('student_id', $ojt->student_id))
        ->map(fn($assignment) => [
          'value' => $assignment->type->value,
          'label' => ucfirst($assignment->type->value),
          'assignment_id' => $assignment->id,
        ]))
      ->unique('value')->values()->all()
    )->all();

    $reviewers = User::query()
      ->whereIn("role", [
        UserRole::ADMIN->value,
        UserRole::INSTRUCTOR->value,
        UserRole::SUPERVISOR->value,
      ])
      ->visibleTo($viewer)
      ->orderBy("last_name")
      ->get();

    return view("shared.reports.create", compact("students", "reviewers", "reportTypeOptionsByStudent"));
  }

  public function store(ReportRequest $request) {
    $data = $request->validated();

    $studentOjt = $this->latestActiveStudentOjt((int) $data['student_id'], Auth::user());
    abort_if(!$studentOjt, 422, 'The selected student has no active OJT assignment.');
    $data['ojt_id'] = $studentOjt->id;

    $assignment = ReportAssignment::query()->findOrFail($data['report_assignment_id']);
    abort_unless(
      (int) $assignment->ojt_id === (int) $data['ojt_id']
        && (int) $assignment->ojt?->student_id === (int) $data['student_id']
        && $assignment->published_at?->isPast()
        && !$assignment->reports()->where('student_id', $data['student_id'])->exists(),
      422,
      'That report type is not missing for the selected student.'
    );

    if ($request->hasFile("document_paths")) {
      $data["document_paths"] = collect($request->file("document_paths"))
        ->map(fn($file) => [
          "path" => $file->store("reports", "public"),
          "name" => $file->getClientOriginalName()
        ])
        ->values()
        ->all();
    } else {
      $data["document_paths"] = [];
    }

    Report::create($data);

    $role = Auth::user()->role;

    return redirect()
      ->route("web.{$role->value}.reports.index")
      ->with("success", "Report created successfully.");
  }

  public function show(Report $report): View {
    Gate::authorize('view', $report);

    // The cohort metadata belongs to the Ojt model behind StudentOjt. Loading
    // only StudentOjt leaves its guarded accessors (academic_year/term) null.
    $report->load(['student', 'ojt.ojt', 'reviewer', 'reportAssignment']);

    return view("shared.reports.show", compact("report"));
  }

  public function edit(Report $report): View {
    Gate::authorize('update', $report);

    $viewer = Auth::user();

    $students = User::query()
      ->where("role", UserRole::STUDENT->value)
      ->visibleTo($viewer)
      ->orderBy("last_name")
      ->get();

    $reviewers = User::query()
      ->whereIn("role", [
        UserRole::ADMIN->value,
        UserRole::INSTRUCTOR->value,
        UserRole::SUPERVISOR->value,
      ])
      ->visibleTo($viewer)
      ->orderBy("last_name")
      ->get();

    return view("shared.reports.edit", compact(
      "report",
      "students",
      "reviewers"
    ));
  }

  public function update(ReportRequest $request, Report $report) {
    Gate::authorize('update', $report);

    $data = $request->validated();

    // The student, OJT record, and requirement identify the submission and
    // are not editable from this form.
    $data['student_id'] = $report->student_id;
    $data['ojt_id'] = $report->ojt_id;
    $data['report_assignment_id'] = $report->report_assignment_id;

    $existingPaths = $report->document_paths ?? [];
    $removedPaths = $request->input('remove_document_paths', []);

    if (!empty($removedPaths)) {
      foreach ($removedPaths as $removedPath) {
        Storage::disk('public')->delete($removedPath);
      }
      $existingPaths = collect($existingPaths)->filter(function ($file) use ($removedPaths) {
        $path = is_array($file) ? $file['path'] : $file;
        return !in_array($path, $removedPaths);
      })->values()->all();
    }

    if ($request->hasFile("document_paths")) {
      $newPaths = collect($request->file("document_paths"))
        ->map(fn($file) => [
          "path" => $file->store("reports", "public"),
          "name" => $file->getClientOriginalName()
        ])
        ->values()
        ->all();

      $existingPaths = array_merge($existingPaths, $newPaths);
    }

    $data["document_paths"] = $existingPaths;

    $report->update($data);

    $role = Auth::user()->role;

    return redirect()
      ->route("web.{$role->value}.reports.index")
      ->with("success", "Report updated successfully.");
  }

  private function latestActiveStudentOjt(int $studentId, User $viewer): ?StudentOjt {
    return StudentOjt::query()
      ->where('student_id', $studentId)
      ->whereIn('status', [OjtStatus::PENDING->value, OjtStatus::ONGOING->value])
      ->whereHas('student', fn($q) => $q->visibleTo($viewer))
      ->latest('created_at')
      ->latest('id')
      ->first();
  }

  public function destroy(Report $report) {
    Gate::authorize('delete', $report);

    $report->delete();

    $role = Auth::user()->role;

    return redirect()
      ->route("web.{$role->value}.reports.index")
      ->with("success", "Report deleted successfully.");
  }

  public function restore(Report $report) {
    Gate::authorize('restore', $report);
    $report->restore();

    return back()->with('success', 'Report restored successfully.');
  }
}
