<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model {
  use HasFactory;

  protected $table = 'attendance';

  protected $fillable = [
    'student_id',
    'ojt_id',
    'date',
    'morning_in',
    'morning_in_verified',
    'morning_out',
    'morning_out_verified',
    'afternoon_in',
    'afternoon_in_verified',
    'afternoon_out',
    'afternoon_out_verified',
  ];

  protected function casts(): array {
    return [
      'date' => 'date:Y-m-d',
      'morning_in' => 'datetime:H:i',
      'morning_out' => 'datetime:H:i',
      'afternoon_in' => 'datetime:H:i',
      'afternoon_out' => 'datetime:H:i',
      'morning_in_verified' => 'boolean',
      'morning_out_verified' => 'boolean',
      'afternoon_in_verified' => 'boolean',
      'afternoon_out_verified' => 'boolean',
    ];
  }

  public function student(): BelongsTo {
    return $this->belongsTo(User::class, 'student_id');
  }

  public function ojt(): BelongsTo {
    return $this->belongsTo(StudentOjt::class, 'ojt_id');
  }

  public function getApprovedHoursAttribute(): float {
    $total = 0.0;

    if ($this->morning_in && $this->morning_out && $this->morning_in_verified && $this->morning_out_verified) {
      $total += $this->sessionHours($this->morning_in, $this->morning_out);
    }

    if ($this->afternoon_in && $this->afternoon_out && $this->afternoon_in_verified && $this->afternoon_out_verified) {
      $total += $this->sessionHours($this->afternoon_in, $this->afternoon_out);
    }

    return round($total, 2);
  }

  public function getTotalHoursAttribute(): float {
    $total = 0.0;

    if ($this->morning_in && $this->morning_out) {
      $total += $this->sessionHours($this->morning_in, $this->morning_out);
    }

    if ($this->afternoon_in && $this->afternoon_out) {
      $total += $this->sessionHours($this->afternoon_in, $this->afternoon_out);
    }

    return round($total, 2);
  }

  private function sessionHours(mixed $timeIn, mixed $timeOut): float {
    $start = \Carbon\Carbon::parse((string) $timeIn);
    $end = \Carbon\Carbon::parse((string) $timeOut);

    return max(0, round($start->diffInMinutes($end, false) / 60, 2));
  }

  public function getIsFullyApprovedAttribute(): bool {
    return (bool) ($this->morning_in_verified && $this->morning_out_verified && $this->afternoon_in_verified && $this->afternoon_out_verified);
  }

  public function getAttendanceStatusesAttribute(): array {
    $office = $this->ojt?->office;
    $statuses = [];

    if (!$this->morning_in) {
      return ['absent'];
    }

    if ($office?->morning_in && $this->isAfterSchedule($this->morning_in, $office->morning_in)) {
      $statuses[] = 'late';
    }

    if ($office?->morning_out && $this->morning_out && $this->isBeforeSchedule($this->morning_out, $office->morning_out)) {
      $statuses[] = 'early out';
    }

    if ($office?->afternoon_out && $this->afternoon_out && $this->isBeforeSchedule($this->afternoon_out, $office->afternoon_out)) {
      $statuses[] = 'early out';
    }

    if (($this->morning_in && !$this->morning_out) || ($this->afternoon_in && !$this->afternoon_out)) {
      $statuses[] = 'incomplete';
    }

    return array_values(array_unique($statuses ?: ['present']));
  }

  private function isAfterSchedule(mixed $actual, mixed $scheduled): bool {
    return \Carbon\Carbon::parse((string) $actual)->format('H:i') > \Carbon\Carbon::parse((string) $scheduled)->format('H:i');
  }

  private function isBeforeSchedule(mixed $actual, mixed $scheduled): bool {
    return \Carbon\Carbon::parse((string) $actual)->format('H:i') < \Carbon\Carbon::parse((string) $scheduled)->format('H:i');
  }
}
