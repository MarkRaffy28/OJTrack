<?php

namespace App\Http\Controllers\Web;

use App\Enums\ReportStatus;
use App\Enums\UserRoles;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\ReportRequest;
use App\Models\Report;
use App\Models\StudentOjt;
use App\Models\User;
use App\Traits\ScopesForInstructor;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller {
  use ScopesForInstructor;

  public function index(): View {
    $query = Report::query()
      ->with(['student', 'ojt', 'reviewer'])
      ->latest();

    $reports = $this->applyInstructorSectionScope($query, null, 'student')
      ->paginate(10);

    return view("shared.reports.index", compact("reports"));
  }

  public function create(): View {
    $studentsQuery = User::query()
      ->where("role", UserRoles::STUDENT->value)
      ->orderBy("last_name");
    $students = $this->applyInstructorSectionScope($studentsQuery, null, 'self')->get();

    $studentOjtsQuery = StudentOjt::query()->with("student")->latest();
    $studentOjts = $this->applyInstructorSectionScope($studentOjtsQuery, null, 'student')->get();

    $reviewers = User::query()
      ->whereIn("role", [
        UserRoles::ADMIN->value,
        UserRoles::INSTRUCTOR->value,
        UserRoles::SUPERVISOR->value,
      ])
      ->orderBy("last_name")
      ->get();

    return view("shared.reports.create", compact(
      "students",
      "studentOjts",
      "reviewers"
    ));
  }

  public function store(ReportRequest $request) {
    $data = $request->validated();

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
    $this->authorizeInstructorStudentAccess($report->student);
    $report->load(['student', 'ojt', 'reviewer']);

    return view("shared.reports.show", compact("report"));
  }

  public function edit(Report $report): View {
    $this->authorizeInstructorStudentAccess($report->student);

    $studentsQuery = User::query()
      ->where("role", UserRoles::STUDENT->value)
      ->orderBy("last_name");
    $students = $this->applyInstructorSectionScope($studentsQuery, null, 'self')->get();

    $studentOjtsQuery = StudentOjt::query()->with("student")->latest();
    $studentOjts = $this->applyInstructorSectionScope($studentOjtsQuery, null, 'student')->get();

    $reviewers = User::query()
      ->whereIn("role", [
        UserRoles::ADMIN->value,
        UserRoles::INSTRUCTOR->value,
        UserRoles::SUPERVISOR->value,
      ])
      ->orderBy("last_name")
      ->get();

    return view("shared.reports.edit", compact(
      "report",
      "students",
      "studentOjts",
      "reviewers"
    ));
  }

  public function update(ReportRequest $request, Report $report) {
    $this->authorizeInstructorStudentAccess($report->student);

    $data = $request->validated();

    $existingPaths = $report->document_paths ?? [];
    $removedPaths = $request->input('remove_document_paths', []);

    if (!empty($removedPaths)) {
      foreach ($removedPaths as $removedPath) {
        \Illuminate\Support\Facades\Storage::disk('public')->delete($removedPath);
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

  public function destroy(Report $report) {
    $this->authorizeInstructorStudentAccess($report->student);
    $report->delete();

    $role = Auth::user()->role;

    return redirect()
      ->route("web.{$role->value}.reports.index")
      ->with("success", "Report deleted successfully.");
  }
}