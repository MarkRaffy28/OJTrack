<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupervisorDetailResource extends JsonResource {
  /**
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array {
    return [
      'position' => $this->position,
      'office' => OfficeResource::make($this->whenLoaded('office')),
    ];
  }
}