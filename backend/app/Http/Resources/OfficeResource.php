<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OfficeResource extends JsonResource {
  /**
   * Transform the resource into an array.
   *
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array {
    return [
      'id' => $this->id,

      'name' => $this->name,
      'address' => $this->address,

      'contactEmail' => $this->contact_email,
      'contactPhone' => $this->contact_phone,

      'morningIn' => $this->morning_in,
      'morningOut' => $this->morning_out,

      'afternoonIn' => $this->afternoon_in,
      'afternoonOut' => $this->afternoon_out,

      'createdAt' => $this->created_at,
      'updatedAt' => $this->updated_at,
    ];
  }
}