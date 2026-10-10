<?php

namespace App\Http\Controllers\Web;

use App\Enums\OjtStatus;
use App\Enums\OjtTerm;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\AssignmentRequest;
use App\Models\Office;
use App\Models\Ojt;
use App\Models\Setting;
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
    ]);

    if (!isset($validated['office_id'])) {
      $offices = Office::query()
        ->withCount([
          'studentOjts as non_completed_students_count' => function ($query) {
            $query->where('status', '!=', OjtStatus::COMPLETED);
          }
        ])
        ->orderBy('name')
        ->get();

      return view('shared.assignments.index', [
        'offices' => $offices,
      ]);
    }

    $query = StudentOjt::query()
      ->with(['student', 'ojt', 'supervisor', 'office', 'attendances'])
      ->search($request->input('search'))
      ->filter($request->only([
        'cohort',
        'status',
      ]))
      ->when(
        isset($validated['office_id']),
        fn($q) => $q->where('office_id', $validated['office_id'])
      )
      ->whereHas('student', fn($q) => $q->visibleTo($viewer))
      ->sort(
        $request->input('sort', 'id'),
        $request->input('direction', 'asc')
      );

    $headers = [
      ['label' => 'ID', 'key' => 'id'],
      ['label' => 'Student', 'key' => 'student'],
      ['label' => 'Supervisor', 'key' => 'supervisor'],
      ['label' => 'Cohort', 'key' => 'cohort'],
      ['label' => 'Status', 'key' => 'status'],
      'Actions',
    ];

    $filters = [
      [
        'name' => 'cohort',
        'label' => 'Cohort',
        'options' => Ojt::query()
          ->select('academic_year', 'term')
          ->distinct()
          ->orderBy('academic_year', 'desc')
          ->orderBy('term')
          ->get()
          ->map(function ($ojt) {
            $termValue = $ojt->term instanceof \BackedEnum ? $ojt->term->value : (string) $ojt->term;

            $formatted = "{$ojt->academic_year} - {$termValue}";
            return [
              'value' => $formatted,
              'label' => "A.Y. {$formatted} Term",
            ];
          })
          ->toArray(),
      ],
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

    $office = Office::findOrFail($validated['office_id']);

    $breadcrumbs = [
      [
        'label' => 'Assignments',
        'url' => route("web.{$viewer->role->value}.assignments.index"),
      ],
      [
        'label' => $office->name,
        'url' => null,
      ],
    ];

    return view('shared.assignments.index', [
      'breadcrumbs' => $breadcrumbs,
      'office' => $office,
      'studentOjts' => $studentOjts,
      'headers' => $headers,
      'filters' => $filters,
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

    $supervisors = User::query()
      ->where("role", UserRole::SUPERVISOR->value)
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

    return view("shared.assignments.create", compact(
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
      ->route("web.{$role->value}.assignments.index")
      ->with("success", "Assignment created successfully.");
  }

  public function show(StudentOjt $studentOjt): View {
    Gate::authorize('view', $studentOjt->student);

    $studentOjt->load(['student', 'supervisor', 'office']);

    $breadcrumbs = [
      [
        'label' => 'Assignments',
        'url' => route("web.{$this->viewer->value}.assignments.index"),
      ],
      [
        'label' => $studentOjt->office->name,
        'url' => route("web.{$this->viewer->value}.assignments.index", [
          'office_id' => $studentOjt->office_id,
        ]),
      ],
      [
        'label' => $studentOjt->student->full_name,
        'url' => null,
      ],
    ];

    return view("shared.assignments.show", compact("studentOjt", "breadcrumbs"));
  }

  public function edit(StudentOjt $studentOjt): View {
    Gate::authorize('update', $studentOjt->student);

    $viewer = Auth::user();

    $students = User::query()
      ->where("role", UserRole::STUDENT->value)
      ->visibleTo($viewer)
      ->orderBy("last_name")
      ->get();

    $supervisors = User::query()
      ->where("role", UserRole::SUPERVISOR->value)
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

    return view("shared.assignments.edit", compact(
      "studentOjt",
      "students",
      "supervisors",
      "offices",
      "ojts",
      "officeSupervisorMap"
    ));
  }

  public function update(AssignmentRequest $request, StudentOjt $studentOjt) {
    Gate::authorize('update', $studentOjt->student);

    $studentOjt->update($request->validated());

    $role = Auth::user()->role;

    return redirect()
      ->route("web.{$role->value}.assignments.index")
      ->with("success", "Assignment updated successfully.");
  }

  public function destroy(StudentOjt $studentOjt) {
    Gate::authorize('delete', $studentOjt->student);

    $studentOjt->delete();

    $role = Auth::user()->role;

    return redirect()
      ->route("web.{$role->value}.assignments.index")
      ->with("success", "Assignment deleted successfully.");
  }
}