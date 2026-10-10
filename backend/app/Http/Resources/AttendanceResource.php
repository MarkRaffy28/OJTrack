<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;
use Carbon\CarbonInterface;

class AttendanceResource extends JsonResource {
  /**
   * Transform the resource into an array.
   *
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array {
    return [
      'id' => $this->id,
      'ojt' => StudentOjtResource::make($this->whenLoaded('ojt', $this->ojt)),
      'date' => $this->date ? $this->date->format('Y-m-d') : null,

      'morningIn' => $this->formatTime($this->morning_in),
      'morningInVerified' => (bool) $this->morning_in_verified,

      'morningOut' => $this->formatTime($this->morning_out),
      'morningOutVerified' => (bool) $this->morning_out_verified,

      'afternoonIn' => $this->formatTime($this->afternoon_in),
      'afternoonInVerified' => (bool) $this->afternoon_in_verified,

      'afternoonOut' => $this->formatTime($this->afternoon_out),
      'afternoonOutVerified' => (bool) $this->afternoon_out_verified,

      'totalHours' => $this->computeTotalHours(),
    ];
  }

  /**
   * Compute total logged hours from morning and afternoon sessions.
   */
  private function computeTotalHours(): float {
    $total = 0.0;

    if ($this->morning_in && $this->morning_out) {
      $in = \Carbon\Carbon::parse($this->morning_in);
      $out = \Carbon\Carbon::parse($this->morning_out);
      $total += max(0, $in->diffInMinutes($out, false)) / 60;
    }

    if ($this->afternoon_in && $this->afternoon_out) {
      $in = \Carbon\Carbon::parse($this->afternoon_in);
      $out = \Carbon\Carbon::parse($this->afternoon_out);
      $total += max(0, $in->diffInMinutes($out, false)) / 60;
    }

    return round($total, 2);
  }

  /**
   * Keep attendance times in the HH:mm shape expected by the mobile app.
   */
  private function formatTime(mixed $value): ?string {
    if ($value === null || $value === '') {
      return null;
    }

    if ($value instanceof CarbonInterface) {
      return $value->format('H:i');
    }

    try {
      return Carbon::parse((string) $value)->format('H:i');
    } catch (\Throwable) {
      return null;
    }
  }
}
