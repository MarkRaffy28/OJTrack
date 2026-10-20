<?php

namespace App\Http\Controllers\Api;

use App\Enums\OjtStatus;
use App\Enums\ReportStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Report\CreateReportRequest;
use App\Http\Requests\Report\UpdateReportRequest;
use App\Http\Resources\ReportResource;
use App\Models\Report;
use App\Models\ReportAssignment;
use App\Models\StudentOjt;
use App\Models\User;
use App\Models\Setting;
use App\Enums\SettingKey;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ReportController extends Controller {

  public function templates(): JsonResponse {
    $keys = [
      'daily' => SettingKey::REPORT_TEMPLATE_DAILY->value,
      'weekly' => SettingKey::REPORT_TEMPLATE_WEEKLY->value,
      'monthly' => SettingKey::REPORT_TEMPLATE_MONTHLY->value,
      'terminal' => SettingKey::REPORT_TEMPLATE_TERMINAL->value,
    ];
    $settings = Setting::whereIn('setting_key', array_values($keys))->get()->keyBy('setting_key');

    return response()->json(collect($keys)->mapWithKeys(fn ($key, $type) => [
      $type => ($path = $settings->get($key)?->setting_value)
        ? ['path' => $path, 'url' => asset('storage/' . $path)]
        : null,
    ]));
  }

  /**
   * Resolve the current (ongoing) OJT for a student.
   */
  protected function getOngoingOjt(User $user): StudentOjt {
    $ojt = StudentOjt::where('student_id', $user->id)
      ->where('status', OjtStatus::ONGOING)
      ->latest()
      ->first();

    if (!$ojt) {
      $ojt = StudentOjt::where('student_id', $user->id)
        ->latest()
        ->first();
    }

    if (!$ojt) {
      throw ValidationException::withMessages([
        'ojt' => ['Student is not assigned to any OJT record.'],
      ]);
    }

    return $ojt;
  }

  /**
   * Store uploaded document files and return their storage paths.
   *
   * @param  \Illuminate\Http\UploadedFile[]  $files
   * @return string[]
   */
  protected function storeDocuments(array $files): array {
    return array_map(fn($file) => $file->store('reports/documents', 'public'), $files);
  }

  /**
   * GET /reports
   * Return all reports for the authenticated student or supervisor's trainees.
   */
  public function index(Request $request): JsonResponse {
    $user = $request->user();

    if ($user->role === UserRole::SUPERVISOR) {
      $reports = Report::with(['student', 'reviewer', 'reportAssignment'])
        ->whereHas('ojt', function ($q) use ($user) {
          $q->whereHas('supervisor', fn ($supervisor) => $supervisor->whereKey($user->id));
        })
        ->orderBy('report_date', 'desc')
        ->get();
    } else {
      $reports = Report::with(['student', 'reviewer', 'reportAssignment'])
        ->where('student_id', $user->id)
        ->orderBy('report_date', 'desc')
        ->get();
    }

    return response()->json(ReportResource::collection($reports));
  }

  /** Return published assignments for the student's current OJT cohort. */
  public function assignments(Request $request): JsonResponse {
    $ojt = $this->getOngoingOjt($request->user());
    $assignments = ReportAssignment::query()
      ->with(['reports' => fn($q) => $q->where('student_id', $request->user()->id)])
      ->where('ojt_id', $ojt->ojt_id)
      ->whereNotNull('published_at')
      ->latest('due_at')
      ->get()
      ->map(fn($assignment) => [
        'id' => $assignment->id,
        'title' => $assignment->title,
        'type' => $assignment->type->value,
        'dueAt' => $assignment->due_at?->toIso8601String(),
        'allowLateSubmission' => $assignment->allow_late_submission,
        'submitted' => $assignment->reports->isNotEmpty(),
        'report' => $assignment->reports->first() ? ReportResource::make($assignment->reports->first())->resolve() : null,
      ]);

    return response()->json($assignments);
  }

  /**
   * GET /reports/{id}
   * Return a single report belonging to the authenticated student or supervisor's trainee.
   */
  public function show(Request $request, int $id): JsonResponse {
    $user = $request->user();

    $query = Report::with(['student', 'reviewer', 'reportAssignment'])->where('id', $id);

    if ($user->role === UserRole::SUPERVISOR) {
      $query->whereHas('ojt', function ($q) use ($user) {
        $q->whereHas('supervisor', fn ($supervisor) => $supervisor->whereKey($user->id));
      });
    } else {
      $query->where('student_id', $user->id);
    }

    $report = $query->first();

    if (!$report) {
      return response()->json(['message' => 'Report not found.'], 404);
    }

    return response()->json(ReportResource::make($report));
  }

  /**
   * POST /reports
   * Create a new report for the authenticated student.
   */
  public function store(CreateReportRequest $request): JsonResponse {
    $user = $request->user();
    $ojt  = $this->getOngoingOjt($user);
    $data = $request->validated();
    $assignment = ReportAssignment::whereKey($data['reportAssignmentId'])
      ->where('ojt_id', $ojt->ojt_id)
      ->whereNotNull('published_at')
      ->first();

    if (!$assignment) {
      return response()->json(['message' => 'Report assignment not found for your current OJT cohort.'], 404);
    }

    if (Report::where('report_assignment_id', $assignment->id)->where('student_id', $user->id)->exists()) {
      return response()->json(['message' => 'You have already submitted this assignment.'], 422);
    }

    $late = $assignment->due_at && now()->greaterThan($assignment->due_at);
    if ($late && !$assignment->allow_late_submission) {
      return response()->json(['message' => 'This assignment is past due and no longer accepts submissions.'], 422);
    }

    $documentPaths = [];
    if ($request->hasFile('documents')) {
      $documentPaths = $this->storeDocuments($request->file('documents'));
    }

    $report = Report::create([
      'student_id'     => $user->id,
      'report_assignment_id' => $assignment->id,
      'ojt_id'         => $ojt->id,
      'report_date'    => $assignment->due_at?->toDateString() ?? ($data['reportDate'] ?? now()->toDateString()),
      'document_paths' => $documentPaths ?: null,
      'is_late'        => $late,
      'status'         => ReportStatus::PENDING,
    ]);

    $report->load(['student', 'reviewer', 'reportAssignment']);

    return response()->json(ReportResource::make($report), 201);
  }

  /**
   * PATCH /reports/{id}
   * Update an existing report. Only the owning student may update,
   * and only while the report is still pending.
   */
  public function update(UpdateReportRequest $request, int $id): JsonResponse {
    $user = $request->user();

    $report = Report::where('id', $id)
      ->when(!$user->isAdmin() && !$user->isSuperAdmin(), fn($q) => $q->where('student_id', $user->id))
      ->first();

    if (!$report) {
      return response()->json(['message' => 'Report not found.'], 404);
    }

    if (!$user->isAdmin() && !$user->isSuperAdmin() && $report->status !== ReportStatus::PENDING) {
      return response()->json(['message' => 'Only pending reports can be updated.'], 422);
    }

    $data = $request->validated();

    if (isset($data['reportDate'])) {
      $report->report_date = $data['reportDate'];
    }

    if ($request->hasFile('documents')) {
      $report->document_paths = $this->storeDocuments($request->file('documents'));
    }

    $report->save();
    $report->load(['student', 'reviewer', 'reportAssignment']);

    return response()->json(ReportResource::make($report));
  }

  /**
   * DELETE /reports/{id}
   * Soft-delete a report. Only the owning student may delete,
   * and only while the report is still pending.
   */
  public function destroy(Request $request, int $id): JsonResponse {
    $user = $request->user();

    $report = Report::where('id', $id)
      ->when(!$user->isAdmin() && !$user->isSuperAdmin(), fn($q) => $q->where('student_id', $user->id))
      ->first();

    if (!$report) {
      return response()->json(['message' => 'Report not found.'], 404);
    }

    if (!$user->isAdmin() && !$user->isSuperAdmin() && $report->status !== ReportStatus::PENDING) {
      return response()->json(['message' => 'Only pending reports can be deleted.'], 422);
    }

    $report->delete();

    return response()->json(['message' => 'Report deleted successfully.']);
  }

  /**
   * POST /reports/{id}/review
   * Supervisor review of a report (approve or reject with feedback).
   */
  public function review(Request $request, int $id): JsonResponse {
    $user = $request->user();

    if (!$user->isSupervisor() && !$user->isAdmin() && !$user->isSuperAdmin()) {
      return response()->json(['message' => 'Unauthorized.'], 403);
    }

    $validated = $request->validate([
      'status'   => ['nullable', 'string', 'in:approved,rejected'],
      'feedback' => ['nullable', 'string'],
    ]);

    $report = Report::where('id', $id)
      ->when($user->isSupervisor(), function ($q) use ($user) {
        $q->whereHas('ojt', function ($q) use ($user) {
          $q->whereHas('supervisor', fn ($supervisor) => $supervisor->whereKey($user->id));
        });
      })
      ->first();

    if (!$report) {
      return response()->json(['message' => 'Report not found.'], 404);
    }

    if (!empty($validated['status'])) {
      $report->status = $validated['status'];
    }
    $report->reviewed_by = $user->id;
    $report->reviewed_at = now();
    $report->feedback = $validated['feedback'] ?? null;
    $report->save();

    $report->load(['student', 'reviewer', 'reportAssignment']);

    return response()->json(ReportResource::make($report));
  }

}
