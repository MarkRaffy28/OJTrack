<?php

namespace App\Http\Controllers\Web;

use App\Enums\ReportStatus;
use App\Enums\ReportType;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\ReportRequest;
use App\Models\Office;
use App\Models\Report;
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

    $query = Report::query()
      ->with([
        'student',
        'ojt.office',
        'reviewer',
      ])
      ->filter($request->only([
        'student_id',
        'office_id',
        'type',
        'status',
      ]))
      ->whereHas('student', fn($q) => $q->visibleTo($viewer))
      ->sort(
        $request->input('sort', 'id'),
        $request->input('direction', 'asc')
      );

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
      ini_set('memory_limit', '512M');
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

    return view('shared.reports.index', [
      'reports' => $reports,
      'headers' => $headers,
      'filters' => $filters,
    ]);
  }

  public function create(): View {
    Gate::authorize('create', Report::class);

    $viewer = Auth::user();

    $students = User::query()
      ->where("role", UserRole::STUDENT->value)
      ->visibleTo($viewer)
      ->orderBy("last_name")
      ->get();

    $studentOjts = StudentOjt::query()
      ->with(['student', 'ojt'])
      ->whereHas('student', fn($q) => $q->visibleTo($viewer))
      ->latest()
      ->get();

    $reviewers = User::query()
      ->whereIn("role", [
        UserRole::ADMIN->value,
        UserRole::INSTRUCTOR->value,
        UserRole::SUPERVISOR->value,
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
    Gate::authorize('view', $report->student);

    $report->load(['student', 'ojt', 'reviewer']);

    return view("shared.reports.show", compact("report"));
  }

  public function edit(Report $report): View {
    Gate::authorize('update', $report->student);

    $viewer = Auth::user();

    $students = User::query()
      ->where("role", UserRole::STUDENT->value)
      ->visibleTo($viewer)
      ->orderBy("last_name")
      ->get();

    $studentOjts = StudentOjt::query()
      ->with(['student', 'ojt'])
      ->whereHas('student', fn($q) => $q->visibleTo($viewer))
      ->latest()
      ->get();

    $reviewers = User::query()
      ->whereIn("role", [
        UserRole::ADMIN->value,
        UserRole::INSTRUCTOR->value,
        UserRole::SUPERVISOR->value,
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
    Gate::authorize('update', $report->student);

    $data = $request->validated();

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

  public function destroy(Report $report) {
    Gate::authorize('delete', $report->student);

    $report->delete();

    $role = Auth::user()->role;

    return redirect()
      ->route("web.{$role->value}.reports.index")
      ->with("success", "Report deleted successfully.");
  }
}