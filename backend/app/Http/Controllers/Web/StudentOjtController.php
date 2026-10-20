<?php

namespace App\Http\Controllers\Web;

use App\Enums\OjtStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\AssignmentRequest;
use App\Models\Office;
use App\Models\Ojt;
use App\Models\Setting;
use App\Models\StudentDetail;
use App\Models\StudentOjt;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class StudentOjtController extends Controller {

  public function index(Request $request): View|Response {
    Gate::authorize('viewAny', StudentOjt::class);

    $viewer = Auth::user();

    $validated = $request->validate([
      'office_id' => ['sometimes', 'required', 'integer', 'exists:offices,id'],
      'all_offices' => ['sometimes', 'boolean'],
      'program' => ['sometimes', 'required', 'string'],
      'section' => ['sometimes', 'required', 'string'],
      'all_sections' => ['sometimes', 'boolean'],
      'all_student_ojts' => ['sometimes', 'boolean'],
    ]);

    $allOffices = $request->boolean('all_offices');
    $allSections = $request->boolean('all_sections');
    $allStudentOjts = $request->boolean('all_student_ojts');

    // Level 1: Select Office (or All Offices)
    if (!isset($validated['office_id']) && !$allOffices) {
      $offices = Office::query()
        ->orderBy('name')
        ->get()
        ->map(function ($office) use ($viewer) {
          $studentOjtsCount = StudentOjt::query()
            ->tap(fn($q) => $this->selectedCohortQuery($q))
            ->whereHas('student', fn($q) => $q->visibleTo($viewer))
            ->where('office_id', $office->id)
            ->count();

          return [
            'office' => $office,
            'student_ojts_count' => $studentOjtsCount,
          ];
        });

      $totalStudentOjtsCount = StudentOjt::query()
        ->tap(fn($q) => $this->selectedCohortQuery($q))
        ->whereHas('student', fn($q) => $q->visibleTo($viewer))
        ->count();

      return view('shared.student-ojts.index', [
        'offices' => $offices,
        'totalStudentOjtsCount' => $totalStudentOjtsCount,
      ]);
    }

    // Level 2: Select Section (or All Sections) for the chosen office / all offices
    if (!isset($validated['section']) && !$allSections && !$allStudentOjts) {
      $officeId = $validated['office_id'] ?? null;

      $sections = StudentDetail::query()
        ->select('program', 'section')
        ->whereNotNull('program')
        ->whereNotNull('section')
        ->distinct()
        ->orderBy('program')
        ->orderBy('section')
        ->get()
        ->map(function ($detail) use ($viewer, $officeId, $allOffices) {
          $program = $detail->program;
          $section = $detail->section;

          $ojtQuery = StudentOjt::query()
            ->tap(fn($q) => $this->selectedCohortQuery($q))
            ->whereHas('student', fn($q) => $q->visibleTo($viewer))
            ->whereHas('student.studentDetail', fn($q) => $q->where('program', $program)->where('section', $section));

          if (!$allOffices && $officeId) {
            $ojtQuery->where('office_id', $officeId);
          }

          return [
            'program' => $program,
            'section' => $section,
            'label' => "{$program} - {$section}",
            'student_ojts_count' => $ojtQuery->count(),
          ];
        });

      $officeOjtQuery = StudentOjt::query()
        ->tap(fn($q) => $this->selectedCohortQuery($q))
        ->whereHas('student', fn($q) => $q->visibleTo($viewer))
        ->when(!$allOffices && $officeId, fn($q) => $q->where('office_id', $officeId));

      $totalOfficeStudentOjtsCount = $officeOjtQuery->count();

      $office = $officeId ? Office::find($officeId) : null;

      $breadcrumbs = [
        [
          'label' => 'Student Ojts',
          'url' => route("web.{$viewer->role->value}.student-ojts.index"),
        ],
      ];

      if ($allOffices) {
        $breadcrumbs[] = ['label' => 'All Offices', 'url' => null];
      } elseif ($office) {
        $breadcrumbs[] = ['label' => $office->name, 'url' => null];
      }

      return view('shared.student-ojts.index', [
        'breadcrumbs' => $breadcrumbs,
        'sections' => $sections,
        'office' => $office,
        'allOffices' => $allOffices,
        'totalOfficeStudentOjtsCount' => $totalOfficeStudentOjtsCount,
      ]);
    }

    // Level 3: Student OJT Table View
    $officeId = $validated['office_id'] ?? null;
    $program = $validated['program'] ?? null;
    $section = $validated['section'] ?? null;

    $query = StudentOjt::query()
      ->tap(fn($q) => $this->selectedCohortQuery($q))
      ->with(['ojt', 'student.studentDetail', 'supervisor', 'office', 'evaluation', 'attendances'])
      ->search($request->input('search'))
      ->whereHas('student', fn($q) => $q->visibleTo($viewer))
      ->filter($request->only([
        'student_id',
        'office_id',
        'status',
      ]))
      ->when(
        !$allOffices && $officeId,
        fn($q) => $q->where('office_id', $officeId)
      )
      ->when(
        $program,
        fn($q) => $q->whereHas('student.studentDetail', fn($sub) => $sub->where('program', $program))
      )
      ->when(
        $section,
        fn($q) => $q->whereHas('student.studentDetail', fn($sub) => $sub->where('section', $section))
      )
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
      ['label' => 'Supervisor', 'key' => 'supervisor'],
      ['label' => 'Office', 'key' => 'office'],
      ['label' => 'Cohort', 'key' => 'cohort'],
      ['label' => 'Required Hours', 'key' => 'required_hours'],
      ['label' => 'Rendered Hours', 'key' => 'rendered_hours'],
      ['label' => 'Progress', 'key' => 'progress'],
      ['label' => 'Status', 'key' => 'status'],
      ['label' => 'Start Date', 'key' => 'start_date'],
      ['label' => 'End Date', 'key' => 'end_date'],
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
        'name' => 'status',
        'label' => 'Status',
        'options' => OjtStatus::options(),
      ],
    ];

    if ($request->boolean('print')) {
      $studentOjts = $query->get();

      return Pdf::loadView('shared.student-ojts.pdf', [
        'studentOjts' => $studentOjts,
      ])
        ->setPaper('a4', 'landscape')
        ->stream('student_ojts.pdf');
    }

    $studentOjts = $query
      ->paginate(10)
      ->withQueryString();

    $office = $officeId ? Office::find($officeId) : null;

    $breadcrumbs = [
      [
        'label' => 'Student Ojts',
        'url' => route("web.{$viewer->role->value}.student-ojts.index"),
      ],
    ];

    if ($allOffices) {
      $breadcrumbs[] = ['label' => 'All Offices', 'url' => route("web.{$viewer->role->value}.student-ojts.index", ['all_offices' => 1])];
    } elseif ($office) {
      $breadcrumbs[] = [
        'label' => $office->name,
        'url' => route("web.{$viewer->role->value}.student-ojts.index", ['office_id' => $office->id]),
      ];
    }

    if ($allSections) {
      $breadcrumbs[] = ['label' => 'All Sections', 'url' => null];
    } elseif ($section) {
      $breadcrumbs[] = ['label' => "{$program} - {$section}", 'url' => null];
    }

    return view('shared.student-ojts.index', [
      'breadcrumbs' => $breadcrumbs,
      'office' => $office,
      'studentOjts' => $studentOjts,
      'headers' => $headers,
      'filters' => $filters,
      'currentProgram' => $program,
      'currentSection' => $section,
    ]);
  }

  public function show(StudentOjt $studentOjt): View {
    Gate::authorize('view', $studentOjt);

    $studentOjt->load(['student', 'supervisor', 'office', 'attendances', 'evaluation']);

    return view("shared.student-ojts.show", compact("studentOjt"));
  }

  public function create(): View {
    Gate::authorize('create', StudentOjt::class);

    $viewer = Auth::user();

    $students = User::query()
      ->where("role", UserRole::STUDENT->value)
      ->whereDoesntHave('studentOjts')
      ->visibleTo($viewer)
      ->orderBy("last_name")
      ->get();

    $supervisors = User::query()
      ->where("role", UserRole::SUPERVISOR->value)
      ->visibleTo($viewer)
      ->with("supervisorDetail")
      ->orderBy("last_name")
      ->get();

    $officeSupervisorMap = $supervisors->mapWithKeys(function ($supervisor) {
      return [$supervisor->supervisorDetail?->office_id => $supervisor->id];
    });

    $offices = Office::query()
      ->orderBy("name")
      ->get();

    $ojts = Ojt::query()->orderByDesc('academic_year')->get();

    $settings = Setting::query()->get()->keyBy(fn($s) => $s->setting_key->value)->map->setting_value;

    return view("shared.student-ojts.create", compact(
      "students",
      "supervisors",
      "offices",
      "ojts",
      "settings",
      "officeSupervisorMap"
    ));
  }

  public function store(AssignmentRequest $request) {
    StudentOjt::create($request->validated());

    $role = Auth::user()->role;

    return redirect()
      ->route("web.{$role->value}.student-ojts.index")
      ->with("success", "Assignment created successfully.");
  }

  public function edit(StudentOjt $studentOjt): View {
    Gate::authorize('update', $studentOjt);

    $viewer = Auth::user();

    $students = User::query()
      ->where("role", UserRole::STUDENT->value)
      ->visibleTo($viewer)
      ->orderBy("last_name")
      ->get();

    $supervisors = User::query()
      ->where("role", UserRole::SUPERVISOR->value)
      ->visibleTo($viewer)
      ->with("supervisorDetail")
      ->orderBy("last_name")
      ->get();

    $officeSupervisorMap = $supervisors->mapWithKeys(function ($supervisor) {
      return [$supervisor->supervisorDetail?->office_id => $supervisor->id];
    });

    $offices = Office::query()
      ->orderBy("name")
      ->get();

    $ojts = Ojt::query()->orderByDesc('academic_year')->get();

    return view("shared.student-ojts.edit", compact(
      "studentOjt",
      "students",
      "supervisors",
      "offices",
      "ojts",
      "officeSupervisorMap"
    ));
  }

  public function update(AssignmentRequest $request, StudentOjt $studentOjt) {
    Gate::authorize('update', $studentOjt);

    $studentOjt->update($request->validated());

    $role = Auth::user()->role;

    return redirect()
      ->route("web.{$role->value}.student-ojts.index")
      ->with("success", "Assignment updated successfully.");
  }

  public function destroy(StudentOjt $studentOjt) {
    Gate::authorize('delete', $studentOjt);

    $studentOjt->delete();

    $role = Auth::user()->role;

    return redirect()
      ->route("web.{$role->value}.student-ojts.index")
      ->with("success", "Assignment deleted successfully.");
  }
}
