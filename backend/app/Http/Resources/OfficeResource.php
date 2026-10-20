<?php

namespace App\Http\Resources;

use Carbon\CarbonInterface;
use Carbon\Carbon;
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

      'morningIn' => $this->formatTime($this->morning_in),
      'morningOut' => $this->formatTime($this->morning_out),

      'afternoonIn' => $this->formatTime($this->afternoon_in),
      'afternoonOut' => $this->formatTime($this->afternoon_out),

      'createdAt' => $this->created_at,
      'updatedAt' => $this->updated_at,
    ];
  }

  private function formatTime(mixed $time): ?string {
    if (!$time) return null;

    if ($time instanceof CarbonInterface) {
      return $time->format('H:i:s');
    }

    try {
      return Carbon::parse((string) $time)->format('H:i:s');
    } catch (\Throwable) {
      return (string) $time;
    }
  }
}
