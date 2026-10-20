<?php

namespace App\Http\Resources;

use App\Utils\ProfilePictureUtil;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource {
  /**
   * Transform the resource into an array.
   *
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array {
    return [
      'id'         => $this->id,
      'studentId'  => $this->student_id,
      'ojtId'      => $this->ojt_id,
      'reportAssignmentId' => $this->report_assignment_id,
      'type'       => $this->reportAssignment?->type,
      'assignment' => $this->whenLoaded('reportAssignment', fn() => [
        'id' => $this->reportAssignment->id,
        'title' => $this->reportAssignment->title,
        'type' => $this->reportAssignment->type?->value,
        'dueAt' => $this->reportAssignment->due_at?->toIso8601String(),
        'allowLateSubmission' => $this->reportAssignment->allow_late_submission,
      ]),

      'reportDate' => $this->report_date ? $this->report_date->format('Y-m-d') : null,
      'deadline'   => $this->reportAssignment?->due_at?->toIso8601String(),
      'isLate'     => $this->is_late,
      'documents'  => $this->resolveDocuments(),

      'status' => $this->status,

      'student' => ($this->relationLoaded('student') && $this->student) ? [
        'id'        => $this->student->id,
        'fullName'  => $this->student->full_name,
        'email'     => $this->student->email,
        'user_id'   => $this->student->user_id,
        'profilePicture' => ProfilePictureUtil::toBase64($this->student->profile_picture),
      ] : null,

      'reviewedBy' => ($this->relationLoaded('reviewer') && $this->reviewer) ? $this->reviewer->full_name : null,
      'reviewedAt' => $this->reviewed_at?->format('M d, Y h:i A') ?? null,
      'feedback'   => $this->feedback ?? null,
    ];
  }

  /**
   * Resolve document_paths (stored as JSON array of paths) into document objects
   * with name, path, and public URL.
   */
  private function resolveDocuments(): ?array {
    if (!$this->document_paths) {
      return null;
    }

    return array_map(function (string $path) {
      return [
        'name' => basename($path),
        'path' => $path,
        'url'  => asset('storage/' . $path),
      ];
    }, $this->document_paths);
  }
}
