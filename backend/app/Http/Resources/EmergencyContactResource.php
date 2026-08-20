<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmergencyContactResource extends JsonResource {
  /**
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array {
    return [
      'id' => $this->id,
      'name' => $this->name,
      'relationship' => $this->relationship,
      'contactNumber' => $this->contact_number,
      'address' => $this->address,
      'isPrimary' => $this->is_primary,
    ];
  }
}