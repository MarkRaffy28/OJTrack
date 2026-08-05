<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentDetailResource extends JsonResource {
  /**
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array {
    return [
      'year' => $this->year,
      'program' => $this->program,
      'major' => $this->major,
      'section' => $this->section,
    ];
  }
}