<?php

namespace App\Http\Controllers\Web;

use App\Enums\OjtStatus;
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

class StudentOjtController extends Controller {

  public function index(Request $request): View|Response {
    Gate::authorize('viewAny', StudentOjt::class);

    $viewer = Auth::user();

    $query = StudentOjt::query()
      ->with(['ojt', 'student', 'supervisor', 'office', 'evaluation', 'attendances'])
      ->whereHas('student', fn($q) => $q->visibleTo($viewer))
      ->filter($request->only([
        'student_id',
        'office_id',
        'cohort',
        'status',
      ]))
      ->sort(
        $request->input('sort', 'id'),
        $request->input('direction', 'asc')
      );

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
        'options' => User::query()
          ->where("role", UserRole::STUDENT->value)
          ->visibleTo($viewer)
          ->orderBy('last_name')
          ->get()
          ->map(fn($student) => [
            'value' => $student->id,
            'label' => $student->full_name,
          ])
          ->toArray(),
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

      return Pdf::loadView('shared.student-ojts.pdf', [
        'studentOjts' => $studentOjts,
      ])
        ->setPaper('a4', 'landscape')
        ->stream('student_ojts.pdf');
    }

    $studentOjts = $query
      ->paginate(10)
      ->withQueryString();

    return view('shared.student-ojts.index', [
      'studentOjts' => $studentOjts,
      'headers' => $headers,
      'filters' => $filters,
    ]);
  }

  public function show(StudentOjt $studentOjt): View {
    Gate::authorize('view', $studentOjt->student);

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
    Gate::authorize('update', $studentOjt->student);

    $studentOjt->update($request->validated());

    $role = Auth::user()->role;

    return redirect()
      ->route("web.{$role->value}.student-ojts.index")
      ->with("success", "Assignment updated successfully.");
  }

  public function destroy(StudentOjt $studentOjt) {
    Gate::authorize('delete', $studentOjt->student);

    $studentOjt->delete();

    $role = Auth::user()->role;

    return redirect()
      ->route("web.{$role->value}.student-ojts.index")
      ->with("success", "Assignment deleted successfully.");
  }
}