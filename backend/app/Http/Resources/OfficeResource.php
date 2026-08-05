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

      'contact_email' => $this->contact_email,
      'contact_phone' => $this->contact_phone,

      'morning_in' => $this->morning_in,
      'morning_out' => $this->morning_out,

      'afternoon_in' => $this->afternoon_in,
      'afternoon_out' => $this->afternoon_out,

      'created_at' => $this->created_at,
      'updated_at' => $this->updated_at,
    ];
  }
}