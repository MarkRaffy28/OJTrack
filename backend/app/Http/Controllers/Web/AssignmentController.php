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

class AssignmentController extends Controller {

  public function index(Request $request): View|Response {
    Gate::authorize('viewAny', StudentOjt::class);

    $viewer = Auth::user();

    $validated = $request->validate([
      'office_id' => ['sometimes', 'required', 'integer', 'exists:offices,id'],
      'all_offices' => ['sometimes', 'boolean'],
      'program' => ['sometimes', 'required', 'string'],
      'section' => ['sometimes', 'required', 'string'],
      'all_sections' => ['sometimes', 'boolean'],
      'all_assignments' => ['sometimes', 'boolean'],
    ]);

    $allOffices = $request->boolean('all_offices');
    $allSections = $request->boolean('all_sections');
    $allAssignments = $request->boolean('all_assignments');

    if (!isset($validated['office_id']) && !$allOffices) {
      $offices = Office::query()
        ->withCount(['studentOjts' => fn($q) => $this->selectedCohortQuery($q)])
        ->orderBy('name')
        ->get();

      return view('shared.assignments.index', [
        'offices' => $offices,
      ]);
    }

    // Level 2: Select Section (or All Sections) for the chosen office / all offices
    if (!isset($validated['section']) && !$allSections && !$allAssignments) {
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

          $assignmentQuery = StudentOjt::query()
            ->withTrashed()
            ->tap(fn($q) => $this->selectedCohortQuery($q))
            ->whereHas('student', fn($q) => $q->visibleTo($viewer))
            ->whereHas('student.studentDetail', fn($q) => $q
              ->where('program', $program)
              ->where('section', $section));

          if (!$allOffices && $officeId) {
            $assignmentQuery->where('office_id', $officeId);
          }

          return [
            'program' => $program,
            'section' => $section,
            'label' => "{$program} - {$section}",
            'assignments_count' => $assignmentQuery->count(),
          ];
        });

      $officeAssignmentQuery = StudentOjt::query()
        ->withTrashed()
        ->tap(fn($q) => $this->selectedCohortQuery($q))
        ->whereHas('student', fn($q) => $q->visibleTo($viewer))
        ->when(!$allOffices && $officeId, fn($q) => $q->where('office_id', $officeId));

      $totalOfficeAssignmentsCount = $officeAssignmentQuery->count();
      $office = $officeId ? Office::find($officeId) : null;

      $breadcrumbs = [
        [
          'label' => 'Assignments',
          'url' => route("web.{$viewer->role->value}.assignments.index"),
        ],
      ];

      if ($allOffices) {
        $breadcrumbs[] = ['label' => 'All Offices', 'url' => null];
      } elseif ($office) {
        $breadcrumbs[] = ['label' => $office->name, 'url' => null];
      }

      return view('shared.assignments.index', [
        'breadcrumbs' => $breadcrumbs,
        'sections' => $sections,
        'office' => $office,
        'allOffices' => $allOffices,
        'totalOfficeAssignmentsCount' => $totalOfficeAssignmentsCount,
      ]);
    }

    $query = StudentOjt::query()
      ->withTrashed()
      ->tap(fn($q) => $this->selectedCohortQuery($q))
      ->with(['student', 'ojt', 'supervisor', 'office'])
      ->when(
        $request->boolean('print'),
        fn($q) => $q->with('attendances')
      )
      ->search($request->input('search'))
      ->filter($request->only('status'))
      ->when(
        isset($validated['office_id']),
        fn($q) => $q->where('office_id', $validated['office_id'])
      )
      ->when(
        isset($validated['program']) && isset($validated['section']),
        fn($q) => $q->whereHas('student.studentDetail', fn($sub) => $sub
          ->where('program', $validated['program'])
          ->where('section', $validated['section']))
      )
      ->whereHas('student', fn($q) => $q->visibleTo($viewer))
      ->sort(
        $request->input('sort', 'id'),
        $request->input('direction', 'desc')
      );

    $headers = [
      ['label' => 'ID', 'key' => 'id'],
      ['label' => 'Student', 'key' => 'student'],
      ['label' => 'Supervisor', 'key' => 'supervisor'],
      ['label' => 'Office', 'key' => 'office'],
      ['label' => 'Cohort', 'key' => 'cohort'],
      ['label' => 'Status', 'key' => 'status'],
      'Actions',
    ];

    $filters = [
      [
        'name' => 'status',
        'label' => 'Status',
        'options' => OjtStatus::options(),
      ],
    ];

    if ($request->boolean('print')) {
      $studentOjts = $query->get();

      return Pdf::loadView('shared.assignments.pdf', [
        'studentOjts' => $studentOjts,
      ])
        ->setPaper('a4', 'landscape')
        ->stream('assignments.pdf');
    }

    $studentOjts = $query
      ->paginate(20)
      ->withQueryString();

    $office = isset($validated['office_id'])
      ? Office::findOrFail($validated['office_id'])
      : null;

    $breadcrumbs = [
      [
        'label' => 'Assignments',
        'url' => route("web.{$viewer->role->value}.assignments.index"),
      ],
    ];

    if ($office) {
      $breadcrumbs[] = [
        'label' => $office->name,
        'url' => null,
      ];
    } else {
      $breadcrumbs[] = [
        'label' => 'All Offices',
        'url' => null,
      ];
    }

    if (isset($validated['section'])) {
      $breadcrumbs[] = [
        'label' => "{$validated['program']} - {$validated['section']}",
        'url' => null,
      ];
    } elseif ($allSections) {
      $breadcrumbs[] = [
        'label' => 'All Sections',
        'url' => null,
      ];
    }

    return view('shared.assignments.index', [
      'breadcrumbs' => $breadcrumbs,
      'office' => $office,
      'studentOjts' => $studentOjts,
      'headers' => $headers,
      'filters' => $filters,
      'currentProgram' => $validated['program'] ?? null,
      'currentSection' => $validated['section'] ?? null,
    ]);
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

    $instructors = User::query()
      ->where("role", UserRole::INSTRUCTOR->value)
      ->visibleTo($viewer)
      ->with("instructorDetail")
      ->orderBy("last_name")
      ->get();

    $offices = Office::query()
      ->orderBy("name")
      ->get();

    $ojts = Ojt::query()->orderByDesc('academic_year')->get();

    $settings = Setting::query()->get()->keyBy(fn($s) => $s->setting_key->value)->map->setting_value;

    return view("shared.assignments.create", compact(
      "students",
      "instructors",
      "offices",
      "ojts",
      "settings",
    ));
  }

  public function store(AssignmentRequest $request) {
    StudentOjt::create($request->validated());

    $role = Auth::user()->role;

    return redirect()
      ->route("web.{$role->value}.assignments.index")
      ->with("success", "Assignment created successfully.");
  }

  public function show(Request $request, StudentOjt $studentOjt): View {
    Gate::authorize('view', $studentOjt);

    $studentOjt->load(['student', 'supervisor', 'office']);

    return view("shared.assignments.show", compact("studentOjt"));
}

  public function edit(StudentOjt $studentOjt): View {
    Gate::authorize('update', $studentOjt);

    $viewer = Auth::user();

    $students = User::query()
      ->where("role", UserRole::STUDENT->value)
      ->visibleTo($viewer)
      ->orderBy("last_name")
      ->get();

    $instructors = User::query()
      ->where("role", UserRole::INSTRUCTOR->value)
      ->visibleTo($viewer)
      ->with("instructorDetail")
      ->orderBy("last_name")
      ->get();

    $offices = Office::query()
      ->orderBy("name")
      ->get();

    $ojts = Ojt::query()->orderByDesc('academic_year')->get();

    return view("shared.assignments.edit", compact(
      "studentOjt",
      "students",
      "instructors",
      "offices",
      "ojts",
    ));
  }

  public function update(AssignmentRequest $request, StudentOjt $studentOjt) {
    Gate::authorize('update', $studentOjt);

    $studentOjt->update($request->validated());

    $role = Auth::user()->role;

    return redirect()
      ->route("web.{$role->value}.assignments.index")
      ->with("success", "Assignment updated successfully.");
  }


  public function destroy(StudentOjt $studentOjt) {
    Gate::authorize('delete', $studentOjt);

    $studentOjt->delete();

    $role = Auth::user()->role;

    return redirect()
      ->route("web.{$role->value}.assignments.index")
      ->with("success", "Assignment deleted successfully.");
  }

  public function restore(StudentOjt $studentOjt) {
    Gate::authorize('restore', $studentOjt);
    $studentOjt->restore();

    return back()->with('success', 'Assignment restored successfully.');
  }
}
