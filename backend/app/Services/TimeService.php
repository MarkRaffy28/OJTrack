<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class TimeService {
  public const TIMEZONE = 'Asia/Manila'; // GMT+8

  /**
   * Determine and log the next available attendance slot based on current GMT+8 time and constraints:
   * - morning in:    >= office->morning_in (falls back to 07:30 if not set)
   * - morning out:   >= morning_in + 1 min, < 13:00
   * - afternoon in:  > 12:00, <= 17:30
   * - afternoon out: >= afternoon_in + 1 min, <= 17:30
   * - overall window: office->morning_in (or 07:30) – 17:30
   */
  public function logNextSlot(Attendance $attendance, ?Carbon $now = null, bool $isVerified = false): Attendance {
    $now = ($now ?? Carbon::now(self::TIMEZONE))->setTimezone(self::TIMEZONE);

    if (!$this->isAllowedAttendanceDate($now)) {
      throw ValidationException::withMessages([
        'attendance' => ['Attendance logging is not allowed on this date. Please contact an administrator if this is unexpected.'],
      ]);
    }

    $timeString = $now->format('H:i:s');

    $sevenThirtyAm = Carbon::today(self::TIMEZONE)->setTime(7, 30, 0);
    $twelvePm      = Carbon::today(self::TIMEZONE)->setTime(12, 0, 0);
    $onePm         = Carbon::today(self::TIMEZONE)->setTime(13, 0, 0);
    $fiveThirtyPm  = Carbon::today(self::TIMEZONE)->setTime(17, 30, 0);

    // Resolve office schedule (always eager-loaded via Attendance::getWith)
    $office = $attendance->relationLoaded('ojt') && $attendance->ojt?->relationLoaded('office')
      ? $attendance->ojt?->office
      : null;

    // Earliest allowed check-in: office morning_in if set, otherwise 07:30
    $earliestMorningIn = ($office?->morning_in)
      ? Carbon::today(self::TIMEZONE)->setTimeFromTimeString(
          Carbon::parse($office->morning_in)->format('H:i:s')
        )
      : $sevenThirtyAm;

    // Global window guard
    if ($now->lessThan($sevenThirtyAm)) {
      throw ValidationException::withMessages([
        'attendance' => ['Attendance logging is only allowed from 7:30 AM.'],
      ]);
    }
    if ($now->greaterThan($fiveThirtyPm)) {
      throw ValidationException::withMessages([
        'attendance' => ['Attendance logging is only allowed until 5:30 PM.'],
      ]);
    }

    // If current time is before 13:00, handle morning slots
    if ($now->lessThan($onePm) && (!$attendance->morning_in || !$attendance->morning_out)) {
      if (!$attendance->morning_in) {
        // Enforce office morning_in time (falls back to 07:30)
        if ($now->lessThan($earliestMorningIn)) {
          $label = $office?->morning_in
            ? Carbon::parse($office->morning_in)->format('h:i A')
            : '7:30 AM';
          throw ValidationException::withMessages([
            'morningIn' => ["Morning check-in is not allowed before the office schedule at {$label}."],
          ]);
        }

        $attendance->morning_in = $timeString;
        if ($isVerified) {
          $attendance->morning_in_verified = true;
        }
        return $attendance;
      }

      if (!$attendance->morning_out) {
        // Enforce 1-minute gap from morning_in
        $morningInTime = Carbon::parse($attendance->morning_in, self::TIMEZONE);
        if ($now->lessThan($morningInTime->copy()->addMinute())) {
          throw ValidationException::withMessages([
            'morningOut' => ['Morning check-out must be at least 1 minute after morning check-in.'],
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

      $attendance->afternoon_in = $timeString;
      if ($isVerified) {
        $attendance->afternoon_in_verified = true;
      }
      return $attendance;
    }

    if (!$attendance->afternoon_out) {
      // Enforce 1-minute gap from afternoon_in
      $afternoonInTime = Carbon::parse($attendance->afternoon_in, self::TIMEZONE);
      if ($now->lessThan($afternoonInTime->copy()->addMinute())) {
        throw ValidationException::withMessages([
          'afternoonOut' => ['Afternoon check-out must be at least 1 minute after afternoon check-in.'],
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

  /** Return whether the administrator has enabled attendance for this date. */
  public function isAllowedAttendanceDate(Carbon|string $date): bool {
    $date = $date instanceof Carbon
      ? $date->copy()->setTimezone(self::TIMEZONE)
      : Carbon::parse($date, self::TIMEZONE);

    if ($date->isWeekend()) {
      return false;
    }

    $rawDates = Setting::query()
      ->where('setting_key', 'allowed_attendance_dates')
      ->value('setting_value');
    $allowedDates = json_decode((string) $rawDates, true);

    return is_array($allowedDates) && in_array($date->toDateString(), $allowedDates, true);
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
