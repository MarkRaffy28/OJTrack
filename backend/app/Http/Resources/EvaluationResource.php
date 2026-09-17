<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EvaluationResource extends JsonResource {
  public function toArray(Request $request): array {
    return [
      'id' => $this->id,
      'studentOjtId' => $this->student_ojt_id,
      'quality' => $this->quality,
      'productivity' => $this->productivity,
      'initiative' => $this->initiative,
      'timeManagementPunctuality' => $this->time_management_punctuality,
      'properAttireGrooming' => $this->proper_attire_grooming,
      'remarks' => $this->remarks,
      'totalPoints' => $this->total_points,
      'status' => $this->status?->value ?? $this->status,
      'submittedAt' => $this->submitted_at?->toISOString(),
    ];
  }
}
