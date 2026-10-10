<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Support\EvaluationCriteria;

class EvaluationResource extends JsonResource {
  public function toArray(Request $request): array {
    $scores = $this->criteria_scores;
    if (!$scores) {
      $scores = [];
      foreach (EvaluationCriteria::get() as $criterion) {
        $scores[$criterion['key']] = $this->{EvaluationCriteria::databaseKey($criterion['key'])} ?? 0;
      }
    }
    return [
      'id' => $this->id,
      'studentOjtId' => $this->student_ojt_id,
      'scores' => $scores,
      'remarks' => $this->remarks,
      'totalPoints' => $this->total_points,
      'status' => $this->status?->value ?? $this->status,
      'submittedAt' => $this->submitted_at?->toISOString(),
    ];
  }
}
