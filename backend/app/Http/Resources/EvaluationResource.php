<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Support\EvaluationCriteria;

class EvaluationResource extends JsonResource {
  public function toArray(Request $request): array {
    $detail = $this->evaluation_type ? $this : $this->details?->firstWhere('evaluation_type', 'supervisor');
    $scores = $detail?->criteria_scores;
    if (!$scores) {
      $scores = [];
      foreach (EvaluationCriteria::get() as $criterion) {
        $scores[$criterion['key']] = $scores[$criterion['key']] ?? 0;
      }
    }
    return [
      'id' => $this->id,
      'studentOjtId' => $this->evaluation_type ? $this->evaluation?->student_ojt_id : $this->student_ojt_id,
      'scores' => $scores,
      'remarks' => $detail?->remarks,
      'totalPoints' => $detail?->total_points ?? 0,
      'status' => $detail?->status?->value ?? $detail?->status,
      'submittedAt' => $detail?->submitted_at?->toISOString(),
    ];
  }
}
