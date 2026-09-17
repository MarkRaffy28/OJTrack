<?php

namespace App\Services;

use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class TimeService {
  public const TIMEZONE = 'Asia/Manila'; // GMT+8

  /**
   * Determine and log the next available attendance slot based on current GMT+8 time and constraints:
   * - morning in: > 06:00
   * - morning out: < 13:00
   * - afternoon in: > 12:00
   * - afternoon out: < 19:00
   */
  public function logNextSlot(Attendance $attendance, ?Carbon $now = null, bool $isVerified = false): Attendance {
    $now = ($now ?? Carbon::now(self::TIMEZONE))->setTimezone(self::TIMEZONE);

    if ($now->isWeekend()) {
      throw ValidationException::withMessages([
        'attendance' => ['Attendance logging is only permitted on weekdays (Monday to Friday).'],
      ]);
    }

    $timeString = $now->format('H:i:s');

    $sixAm = Carbon::today(self::TIMEZONE)->setTime(6, 0, 0);
    $twelvePm = Carbon::today(self::TIMEZONE)->setTime(12, 0, 0);
    $onePm = Carbon::today(self::TIMEZONE)->setTime(13, 0, 0);
    $ninePm = Carbon::today(self::TIMEZONE)->setTime(19, 0, 0);

    // If current time is before 12:00/13:00, handle morning slots
    if ($now->lessThan($onePm) && (!$attendance->morning_in || !$attendance->morning_out)) {
      if (!$attendance->morning_in) {
        if ($now->lessThanOrEqualTo($sixAm)) {
          throw ValidationException::withMessages([
            'morningIn' => ['Morning check-in is only allowed after 06:00 AM.'],
          ]);
        }

        $attendance->morning_in = $timeString;
        if ($isVerified) {
          $attendance->morning_in_verified = true;
        }
        return $attendance;
      }

      if (!$attendance->morning_out) {
        if ($now->greaterThanOrEqualTo($onePm)) {
          throw ValidationException::withMessages([
            'morningOut' => ['Morning check-out must be before 1:00 PM.'],
          ]);
        }

        $attendance->morning_out = $timeString;
        if ($isVerified) {
          $attendance->morning_out_verified = true;
        }
        return $attendance;
      }
    }

    // Afternoon slots (time >= 12:00)
    if (!$attendance->afternoon_in) {
      if ($now->lessThanOrEqualTo($twelvePm)) {
        throw ValidationException::withMessages([
          'afternoonIn' => ['Afternoon check-in is only allowed after 12:00 PM.'],
        ]);
      }
      if ($now->greaterThanOrEqualTo($ninePm)) {
        throw ValidationException::withMessages([
          'afternoonIn' => ['Afternoon check-in must be before 07:00 PM.'],
        ]);
      }

      $attendance->afternoon_in = $timeString;
      if ($isVerified) {
        $attendance->afternoon_in_verified = true;
      }
      return $attendance;
    }

    if (!$attendance->afternoon_out) {
      if ($now->greaterThanOrEqualTo($ninePm)) {
        throw ValidationException::withMessages([
          'afternoonOut' => ['Afternoon check-out must be before 07:00 PM.'],
        ]);
      }

      $attendance->afternoon_out = $timeString;
      if ($isVerified) {
        $attendance->afternoon_out_verified = true;
      }
      return $attendance;
    }

    throw ValidationException::withMessages([
      'attendance' => ['All attendance slots for today have already been logged.'],
    ]);
  }

  /**
   * Calculate duration in hours between two time strings (HH:MM or HH:MM:SS).
   */
  public function calculateSessionHours(mixed $timeIn, mixed $timeOut): float {
    if (!$timeIn || !$timeOut) {
      return 0.0;
    }

    try {
      $start = Carbon::parse($timeIn, self::TIMEZONE);
      $end = Carbon::parse($timeOut, self::TIMEZONE);

      if ($end->lessThan($start)) {
        return 0.0;
      }

      return round($end->diffInMinutes($start) / 60.0, 2);
    } catch (\Exception $e) {
      return 0.0;
    }
  }

  /**
   * Calculate total rendered hours for a single attendance record.
   */
  public function calculateDailyHours(Attendance $attendance): float {
    $morningHours = $this->calculateSessionHours(
      $attendance->morning_in,
      $attendance->morning_out
    );

    $afternoonHours = $this->calculateSessionHours(
      $attendance->afternoon_in,
      $attendance->afternoon_out
    );

    return round($morningHours + $afternoonHours, 2);
  }

}
