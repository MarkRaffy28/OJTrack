<?php

namespace App\Http\Controllers\Api;

use App\Enums\OjtStatus;
use App\Enums\ReportStatus;
use App\Enums\UserRoles;
use App\Http\Controllers\Controller;
use App\Http\Requests\Report\CreateReportRequest;
use App\Http\Requests\Report\UpdateReportRequest;
use App\Http\Resources\ReportResource;
use App\Models\Report;
use App\Models\StudentOjt;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ReportController extends Controller {

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

    if ($user->role === UserRoles::SUPERVISOR) {
      $reports = Report::with(['student', 'reviewer'])
        ->whereHas('ojt', function ($q) use ($user) {
          $q->where('supervisor_id', $user->id);
        })
        ->orderBy('report_date', 'desc')
        ->get();
    } else {
      $reports = Report::with(['student', 'reviewer'])
        ->where('student_id', $user->id)
        ->orderBy('report_date', 'desc')
        ->get();
    }

    return response()->json(ReportResource::collection($reports));
  }

  /**
   * GET /reports/{id}
   * Return a single report belonging to the authenticated student or supervisor's trainee.
   */
  public function show(Request $request, int $id): JsonResponse {
    $user = $request->user();

    $query = Report::with(['student', 'reviewer'])->where('id', $id);

    if ($user->role === UserRoles::SUPERVISOR) {
      $query->whereHas('ojt', function ($q) use ($user) {
        $q->where('supervisor_id', $user->id);
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

    $documentPaths = [];
    if ($request->hasFile('documents')) {
      $documentPaths = $this->storeDocuments($request->file('documents'));
    }

    $report = Report::create([
      'student_id'     => $user->id,
      'ojt_id'         => $ojt->id,
      'type'           => $data['type'],
      'report_date'    => $data['reportDate'],
      'document_paths' => $documentPaths ?: null,
      'status'         => ReportStatus::PENDING,
    ]);

    $report->load('reviewer');

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
      ->where('student_id', $user->id)
      ->first();

    if (!$report) {
      return response()->json(['message' => 'Report not found.'], 404);
    }

    if ($report->status !== ReportStatus::PENDING) {
      return response()->json(['message' => 'Only pending reports can be updated.'], 422);
    }

    $data = $request->validated();

    if (isset($data['type'])) {
      $report->type = $data['type'];
    }

    if (isset($data['reportDate'])) {
      $report->report_date = $data['reportDate'];
    }

    if ($request->hasFile('documents')) {
      $report->document_paths = $this->storeDocuments($request->file('documents'));
    }

    $report->save();
    $report->load('reviewer');

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
      ->where('student_id', $user->id)
      ->first();

    if (!$report) {
      return response()->json(['message' => 'Report not found.'], 404);
    }

    if ($report->status !== ReportStatus::PENDING) {
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

    if ($user->role !== UserRoles::SUPERVISOR) {
      return response()->json(['message' => 'Unauthorized. Only supervisors can review reports.'], 403);
    }

    $validated = $request->validate([
      'status'   => ['nullable', 'string', 'in:approved,rejected'],
      'feedback' => ['nullable', 'string'],
    ]);

    $report = Report::where('id', $id)
      ->whereHas('ojt', function ($q) use ($user) {
        $q->where('supervisor_id', $user->id);
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

    $report->load(['student', 'reviewer']);

    return response()->json(ReportResource::make($report));
  }
}
