<?php

namespace App\Http\Controllers\Web;

use App\Enums\UserRoles;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\AssignmentRequest;
use App\Models\Office;
use App\Models\Setting;
use App\Models\StudentOjt;
use App\Models\User;
use App\Traits\ScopesForInstructor;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Auth;

class AssignmentController extends Controller {
  use ScopesForInstructor;

  public function index(): View {
    $query = StudentOjt::query()
      ->with(['student', 'supervisor', 'office'])
      ->latest();

    $studentOjts = $this->applyInstructorSectionScope($query, null, 'student')
      ->paginate(10);

    return view("shared.assignments.index", compact("studentOjts"));
  }

  public function create(): View {
    $studentsQuery = User::query()
      ->where("role", UserRoles::STUDENT->value)
      ->orderBy("last_name");
    $students = $this->applyInstructorSectionScope($studentsQuery, null, 'self')->get();

    $supervisors = User::query()
      ->where("role", UserRoles::SUPERVISOR->value)
      ->with("supervisorDetail")
      ->orderBy("last_name")
      ->get();

    $officeSupervisorMap = $supervisors->mapWithKeys(function ($supervisor) {
      return [$supervisor->supervisorDetail?->office_id => $supervisor->id];
    });

    $offices = Office::query()
      ->orderBy("name")
      ->get();

    $settings = Setting::query()->get()->keyBy(fn($s) => $s->setting_key->value)->map->setting_value;

    return view("shared.assignments.create", compact(
      "students",
      "supervisors",
      "offices",
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
    $this->authorizeInstructorStudentAccess($studentOjt->student);
    $studentOjt->load(['student', 'supervisor', 'office']);

    return view("shared.assignments.show", compact("studentOjt"));
  }

  public function edit(StudentOjt $studentOjt): View {
    $this->authorizeInstructorStudentAccess($studentOjt->student);

    $studentsQuery = User::query()
      ->where("role", UserRoles::STUDENT->value)
      ->orderBy("last_name");
    $students = $this->applyInstructorSectionScope($studentsQuery, null, 'self')->get();

    $supervisors = User::query()
      ->where("role", UserRoles::SUPERVISOR->value)
      ->with("supervisorDetail")
      ->orderBy("last_name")
      ->get();

    $officeSupervisorMap = $supervisors->mapWithKeys(function ($supervisor) {
      return [$supervisor->supervisorDetail?->office_id => $supervisor->id];
    });

    $offices = Office::query()
      ->orderBy("name")
      ->get();

    return view("shared.assignments.edit", compact(
      "studentOjt",
      "students",
      "supervisors",
      "offices",
      "officeSupervisorMap"
    ));
  }

  public function update(AssignmentRequest $request, StudentOjt $studentOjt) {
    $this->authorizeInstructorStudentAccess($studentOjt->student);
    $studentOjt->update($request->validated());

    $role = Auth::user()->role;

    return redirect()
      ->route("web.{$role->value}.assignments.index")
      ->with("success", "Assignment updated successfully.");
  }

  public function destroy(StudentOjt $studentOjt) {
    $this->authorizeInstructorStudentAccess($studentOjt->student);
    $studentOjt->delete();

    $role = Auth::user()->role;

    return redirect()
      ->route("web.{$role->value}.assignments.index")
      ->with("success", "Assignment deleted successfully.");
  }
}