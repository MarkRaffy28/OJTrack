<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $student_id
 * @property int $ojt_id
 * @property \Illuminate\Support\Carbon $date
 * @property \Illuminate\Support\Carbon|null $morning_in
 * @property bool $morning_in_verified
 * @property \Illuminate\Support\Carbon|null $morning_out
 * @property bool $morning_out_verified
 * @property \Illuminate\Support\Carbon|null $afternoon_in
 * @property bool $afternoon_in_verified
 * @property \Illuminate\Support\Carbon|null $afternoon_out
 * @property bool $afternoon_out_verified
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read float $approved_hours
 * @property-read array $attendance_statuses
 * @property-read bool $is_fully_approved
 * @property-read float $total_hours
 * @property-read \App\Models\StudentOjt|null $ojt
 * @property-read \App\Models\User|null $student
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereAfternoonIn($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereAfternoonInVerified($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereAfternoonOut($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereAfternoonOutVerified($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereMorningIn($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereMorningInVerified($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereMorningOut($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereMorningOutVerified($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereOjtId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereStudentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Attendance extends Model {
  use HasFactory;

  /**
   * The table associated with the model.
   *
   * @var string
   */
  protected $table = 'attendance';

  /**
   * Get the relationships that should always be eager loaded.
   *
   * @return array<int, string>
   */
  public function getWith(): array {
    return [
      'student',
      'ojt.office',
    ];
  }

  /**
   * Get the fillable attributes for the model.
   *
   * @return array<int, string>
   */
  public function getFillable(): array {
    return [
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
  }

  /**
   * Get the accessors to append to the model's array form.
   *
   * @return array<int, string>
   */
  public function getAppends(): array {
    return [
      'approved_hours',
      'total_hours',
      'is_fully_approved',
      'attendance_statuses',
    ];
  }

  /**
   * Get the attributes that should be cast.
   *
   * @return array<string, string>
   */
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

  protected function approvedHours(): Attribute {
    return Attribute::make(
      get: function (): float {
        $total = 0.0;

        if ($this->morning_in && $this->morning_out && $this->morning_in_verified && $this->morning_out_verified) {
          $total += $this->sessionHours($this->morning_in, $this->morning_out);
        }

        if ($this->afternoon_in && $this->afternoon_out && $this->afternoon_in_verified && $this->afternoon_out_verified) {
          $total += $this->sessionHours($this->afternoon_in, $this->afternoon_out);
        }

        return round($total, 2);
      }
    );
  }

  protected function totalHours(): Attribute {
    return Attribute::make(
      get: function (): float {
        $total = 0.0;

        if ($this->morning_in && $this->morning_out) {
          $total += $this->sessionHours($this->morning_in, $this->morning_out);
        }

        if ($this->afternoon_in && $this->afternoon_out) {
          $total += $this->sessionHours($this->afternoon_in, $this->afternoon_out);
        }

        return round($total, 2);
      }
    );
  }

  protected function isFullyApproved(): Attribute {
    return Attribute::make(
      get: fn(): bool => (bool) (
        $this->morning_in_verified &&
        $this->morning_out_verified &&
        $this->afternoon_in_verified &&
        $this->afternoon_out_verified
      )
    );
  }

  protected function attendanceStatuses(): Attribute {
    return Attribute::make(
      get: function (): array {
        // Safely evaluate office schedule without triggering LazyLoadingViolationException
        $office = $this->relationLoaded('ojt') && $this->ojt?->relationLoaded('office')
          ? $this->ojt?->office
          : null;

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
    );
  }

  public function scopeFilter(Builder $query, array $filters): void {
    $query
      ->when($filters['office_id'] ?? null, function (Builder $query, $officeId) {
        $query->whereHas('ojt', fn(Builder $q) => $q->where('office_id', $officeId));
      })
      ->when($filters['student_id'] ?? null, function ($query, $studentId) {
        $query->where('student_id', $studentId);
      })
      ->when($filters['date_range'] ?? null, function (Builder $query, string $dateRange) {
        if (str_contains($dateRange, ' to ')) {
          [$startDate, $endDate] = explode(' to ', $dateRange);
          $query->whereBetween('date', [trim($startDate), trim($endDate)]);
        } else {
          $query->whereDate('date', trim($dateRange));
        }
      });
  }

  public function scopeSort(Builder $query, ?string $sort = 'date', ?string $direction = 'desc'): void {
    $direction = in_array(strtolower($direction ?? 'desc'), ['asc', 'desc']) ? $direction : 'desc';

    match ($sort) {
      'student' => $query->whereHas('student', fn(Builder $q) =>
        $q->orderBy('first_name', $direction)->orderBy('last_name', $direction)
      ),
      'office' => $query->whereHas('ojt', fn(Builder $q) =>
        $q->whereHas('office', fn(Builder $q2) => $q2->orderBy('name', $direction))
      ),
      'supervisor' => $query->whereHas('ojt', fn(Builder $q) =>
        $q->whereHas('supervisor', fn(Builder $q2) => $q2->orderBy('first_name', $direction)->orderBy('last_name', $direction))
      ),
      'date' => $query->orderBy($sort, $direction),
      default => $query->orderBy('date', $direction),
    };
  }

  public function student(): BelongsTo {
    return $this->belongsTo(User::class, 'student_id');
  }

  public function ojt(): BelongsTo {
    return $this->belongsTo(StudentOjt::class, 'ojt_id');
  }

  private function sessionHours(mixed $timeIn, mixed $timeOut): float {
    $start = Carbon::parse((string) $timeIn);
    $end = Carbon::parse((string) $timeOut);

    return max(0, round($start->diffInMinutes($end, false) / 60, 2));
  }

  private function isAfterSchedule(mixed $actual, mixed $scheduled): bool {
    return Carbon::parse((string) $actual)->format('H:i') > Carbon::parse((string) $scheduled)->format('H:i');
  }

  private function isBeforeSchedule(mixed $actual, mixed $scheduled): bool {
    return Carbon::parse((string) $actual)->format('H:i') < Carbon::parse((string) $scheduled)->format('H:i');
  }
}
