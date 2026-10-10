<?php

namespace App\Models;

use App\Enums\OjtStatus;
use BackedEnum;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

/**
 * @property int $id
 * @property int $student_id
 * @property int $ojt_id
 * @property int|null $instructor_id
 * @property int $office_id
 * @property numeric $required_hours
 * @property OjtStatus $status
 * @property array<array-key, mixed>|null $report_deadlines
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Attendance> $attendances
 * @property-read int|null $attendances_count
 * @property-read \App\Models\Evaluation|null $evaluation
 * @property-read string|null $academic_year
 * @property-read mixed|null $end_date
 * @property-read float $progress_percent
 * @property-read float $rendered_hours
 * @property-read mixed|null $start_date
 * @property-read mixed|null $term
 * @property-read \App\Models\User|null $instructor
 * @property-read \App\Models\Office $office
 * @property-read \App\Models\Ojt $ojt
 * @property-read \App\Models\User|null $student
 * @property-read \App\Models\User|null $supervisor
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentOjt newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentOjt newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentOjt onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentOjt query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentOjt whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentOjt whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentOjt whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentOjt whereInstructorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentOjt whereOfficeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentOjt whereOjtId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentOjt whereReportDeadlines($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentOjt whereRequiredHours($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentOjt whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentOjt whereStudentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentOjt whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentOjt withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentOjt withoutTrashed()
 * @mixin \Eloquent
 */
class StudentOjt extends Model {
  use HasFactory, SoftDeletes;

  /**
   * Get the relationships that should always be eager loaded.
   *
   * @return array<int, string>
   */
  public function getWith(): array {
    return [
      'ojt',
      'attendances',
      'student',
      'office',
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
      'instructor_id',
      'office_id',
      'required_hours',
      'status',
      'report_deadlines',
    ];
  }

  /**
   * Get the attributes that should be cast.
   *
   * @return array<string, string>
   */
  protected function casts(): array {
    return [
      'required_hours' => 'decimal:2',
      'status' => OjtStatus::class,
      'report_deadlines' => 'array',
    ];
  }

  /**
   * Get the accessors to append to the model's array form.
   *
   * @return array<int, string>
   */
  public function getAppends(): array {
    return [
      'academic_year',
      'term',
      'cohort',
      'start_date',
      'end_date',
      'rendered_hours',
      'progress_percent',
    ];
  }

  public function office(): BelongsTo {
    return $this->belongsTo(Office::class, 'office_id');
  }

  public function student(): BelongsTo {
    return $this->belongsTo(User::class, 'student_id');
  }

  public function supervisor(): HasOneThrough {
    return $this->hasOneThrough(User::class, SupervisorDetail::class, 'office_id', 'id', 'office_id', 'user_id');
  }

  public function instructor(): BelongsTo {
    return $this->belongsTo(User::class, 'instructor_id');
  }

  public function ojt(): BelongsTo {
    return $this->belongsTo(Ojt::class);
  }

  public function attendances(): HasMany {
    return $this->hasMany(Attendance::class, 'ojt_id');
  }

  public function evaluation(): HasOne {
    return $this->hasOne(Evaluation::class);
  }

  protected function academicYear(): Attribute {
    return Attribute::make(
      get: fn(): ?string => $this->relationLoaded('ojt') ? $this->ojt?->academic_year : null
    );
  }

  protected function term(): Attribute {
    return Attribute::make(
      get: fn() => $this->relationLoaded('ojt') ? $this->ojt?->term : null
    );
  }

  protected function cohort(): Attribute {
    return Attribute::make(
      get: function (): ?string {
        if (!$this->relationLoaded('ojt') || !$this->ojt?->academic_year) {
          return null;
        }

        $term = $this->ojt->term;
        $termValue = $term instanceof BackedEnum ? $term->value : (string) $term;

        return "A.Y. {$this->ojt->academic_year} - {$termValue} Term";
      }
    );
  }

  protected function startDate(): Attribute {
    return Attribute::make(
      get: fn() => $this->relationLoaded('ojt') ? $this->ojt?->start_date : null
    );
  }

  protected function endDate(): Attribute {
    return Attribute::make(
      get: fn() => $this->relationLoaded('ojt') ? $this->ojt?->end_date : null
    );
  }

  protected function renderedHours(): Attribute {
    return Attribute::make(
      get: fn(): float => $this->relationLoaded('attendances')
      ? round((float) $this->attendances->sum('approved_hours'), 2)
      : 0.0
    );
  }

  protected function progressPercent(): Attribute {
    return Attribute::make(
      get: function (): float {
        $required = (float) $this->required_hours;

        if ($required <= 0) {
          return 0.0;
        }

        return min(100.0, round(($this->rendered_hours / $required) * 100, 1));
      }
    );
  }

  public function scopeSearch(Builder $query, ?string $search): void {
    $query->when($search, function (Builder $query, string $search) {
      $query->where(function (Builder $query) use ($search) {
        $query->whereHas('student', function (Builder $query) use ($search) {
          $query->where('first_name', 'like', "%{$search}%")
            ->orWhere('last_name', 'like', "%{$search}%")
            ->orWhere('user_id', 'like', "%{$search}%");
        })
          ->orWhereHas('supervisor', function (Builder $query) use ($search) {
            $query->where('first_name', 'like', "%{$search}%")
              ->orWhere('last_name', 'like', "%{$search}%");
          })
          ->orWhereHas('office', function (Builder $query) use ($search) {
            $query->where('name', 'like', "%{$search}%");
          });
      });
    });
  }

  public function scopeFilter(Builder $query, array $filters): void {
    $query
      ->when($filters['student_id'] ?? null, function (Builder $query, $studentId) {
        $query->where('student_id', $studentId);
      })
      ->when($filters['office_id'] ?? null, function (Builder $query, $officeId) {
        $query->whereHas('office', fn(Builder $q) => $q->where('id', $officeId));
      })
      ->when($filters['cohort'] ?? null, function (Builder $query, string $cohort) {
        if (preg_match('/(\d{4}-\d{4})\s*-\s*(1st|2nd|Summer)/i', $cohort, $matches)) {
          $academicYear = $matches[1];
          $term = $matches[2];

          $query->whereHas('ojt', function (Builder $q) use ($academicYear, $term) {
            $q->where('academic_year', $academicYear)
              ->where('term', $term);
          });
        }
      })
      ->when($filters['status'] ?? null, fn(Builder $query, $status) =>
        $query->where('status', $status)
      );
  }

  public function scopeSort(Builder $query, ?string $sort = 'id', ?string $direction = 'asc'): void {
    $direction = in_array(strtolower($direction ?? 'asc'), ['asc', 'desc']) ? $direction : 'asc';

    match ($sort) {
      'student' => $query->whereHas('student', fn(Builder $q) =>
        $q->orderBy('first_name', $direction)->orderBy('last_name', $direction)
      ),
      'supervisor' => $query->whereHas('supervisor', fn(Builder $q) =>
        $q->orderBy('first_name', $direction)->orderBy('last_name', $direction)
      ),
      'start_date', 'end_date' => $query->whereHas('ojt', fn(Builder $q) =>
        $q->orderBy($sort, $direction)
      ),
      'cohort' => $query->whereHas('ojt', fn(Builder $q) =>
        $q->orderBy('academic_year', $direction)->orderBy('term', $direction)
      ),
      'rendered_hours' => $query->withSum([
        'attendances as rendered_hours_sum' => function (Builder $q) {
            $q->select(DB::raw("
              COALESCE(SUM(
                CASE
                  WHEN morning_in IS NOT NULL AND morning_out IS NOT NULL
                    AND morning_in_verified = 1 AND morning_out_verified = 1
                  THEN GREATEST(0, TIME_TO_SEC(TIMEDIFF(morning_out, morning_in)) / 3600)
                  ELSE 0
                END
                +
                CASE
                  WHEN afternoon_in IS NOT NULL AND afternoon_out IS NOT NULL
                    AND afternoon_in_verified = 1 AND afternoon_out_verified = 1
                  THEN GREATEST(0, TIME_TO_SEC(TIMEDIFF(afternoon_out, afternoon_in)) / 3600)
                  ELSE 0
                END
              ), 0)
            "));
          },
      ], 'id')
        ->orderBy('rendered_hours_sum', $direction),
      'progress', 'progress_percent' => $query->select('student_ojts.*')
        ->selectSub(
          DB::table('attendance')
            ->whereColumn('attendance.ojt_id', 'student_ojts.id')
            ->selectRaw('COALESCE(SUM(
              (CASE WHEN morning_in_verified = 1 AND morning_out_verified = 1 
                THEN TIMESTAMPDIFF(MINUTE, morning_in, morning_out) / 60 
                ELSE 0 END) +
              (CASE WHEN afternoon_in_verified = 1 AND afternoon_out_verified = 1 
                THEN TIMESTAMPDIFF(MINUTE, afternoon_in, afternoon_out) / 60 
                ELSE 0 END)
              ), 0)')
          , 'rendered_hours_sum'
        )
        ->orderByRaw('(rendered_hours_sum / NULLIF(required_hours, 0)) ' . $direction),
      'required_hours', 'status' => $query->orderBy($sort, $direction),
      default => $query->orderBy('id', $direction),
    };
  }
}
