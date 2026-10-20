<?php

namespace App\Models;

use App\Enums\ReportStatus;
use App\Enums\ReportType;
use App\Models\ReportAssignment;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property int $report_assignment_id
 * @property int $student_id
 * @property int $ojt_id
 * @property \Illuminate\Support\Carbon $report_date
 * @property array<array-key, mixed>|null $document_paths
 * @property bool $is_late
 * @property ReportStatus $status
 * @property int|null $reviewed_by
 * @property \Illuminate\Support\Carbon|null $reviewed_at
 * @property string|null $feedback
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\ReportAssignment|null $reportAssignment
 * @property-read \App\Models\StudentOjt|null $ojt
 * @property-read \App\Models\User|null $reviewer
 * @property-read \App\Models\User|null $student
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Report newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Report newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Report onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Report query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Report whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Report whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Report whereDocumentPaths($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Report whereFeedback($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Report whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Report whereOjtId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Report whereReportDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Report whereReviewedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Report whereReviewedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Report whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Report whereStudentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Report whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Report whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Report withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Report withoutTrashed()
 * @mixin \Eloquent
 */
class Report extends Model {
  use HasFactory, SoftDeletes;

  protected $with = [
    'student',
    'ojt',
    'reviewer',
    'reportAssignment',
  ];

  /**
   * Get the fillable attributes for the model.
   *
   * @return array<int, string>
   */
  public function getFillable(): array {
    return [
      'report_assignment_id',
      'student_id',
      'ojt_id',
      'report_date',
      'document_paths',
      'is_late',
      'status',
      'reviewed_by',
      'reviewed_at',
      'feedback',
    ];
  }

  /**
   * Get the accessors to append to the model's array form.
   *
   * @return arraccy<int, string>
   */
  public function getAppends(): array {
    return [
      'deadline',
    ];
  }

  /**
   * Get the attributes that should be cast.
   *
   * @return array<string, string>
   */
  protected function casts(): array {
    return [
      'status' => ReportStatus::class,
      'document_paths' => 'array',
      'report_date' => 'date:Y-m-d',
      'is_late' => 'boolean',
      'reviewed_at' => 'datetime',
    ];
  }

  public function student(): BelongsTo {
    return $this->belongsTo(User::class, 'student_id');
  }

  public function ojt(): BelongsTo {
    return $this->belongsTo(StudentOjt::class, 'ojt_id');
  }

  public function reviewer(): BelongsTo {
    return $this->belongsTo(User::class, 'reviewed_by');
  }

  public function reportAssignment(): BelongsTo {
    return $this->belongsTo(ReportAssignment::class);
  }

  protected function type(): Attribute {
    return Attribute::make(get: fn() => $this->reportAssignment?->type);
  }

  protected function deadline(): Attribute {
    return Attribute::make(get: fn() => $this->reportAssignment?->due_at?->toIso8601String());
  }

  public function scopeFilter(Builder $query, array $filters): void {
    $query
      ->when($filters['student_id'] ?? null, fn(Builder $query, $studentId) =>
        $query->where('student_id', $studentId)
      )
      ->when($filters['office_id'] ?? null, function (Builder $query, $officeId) {
        $query->whereHas('ojt', fn(Builder $q) => $q->where('office_id', $officeId));
      })
      ->when($filters['type'] ?? null, fn(Builder $query, $type) =>
        $query->whereHas('reportAssignment', fn(Builder $q) => $q->where('type', $type))
      )
      ->when($filters['status'] ?? null, fn(Builder $query, $status) =>
        $query->where('status', $status)
      )
      ->when($filters['date_range'] ?? null, function (Builder $query, string $dateRange) {
        if (str_contains($dateRange, ' to ')) {
          [$startDate, $endDate] = explode(' to ', $dateRange);
          $query->whereBetween('report_date', [trim($startDate), trim($endDate)]);
        } else {
          $query->whereDate('report_date', trim($dateRange));
        }
      });
  }

  public function scopeSort(Builder $query, ?string $sort = 'id', ?string $direction = 'desc'): void {
    $direction = in_array(strtolower($direction ?? 'desc'), ['asc', 'desc']) ? $direction : 'desc';

    match ($sort) {
      'student' => $query->whereHas('student', fn(Builder $q) =>
        $q->orderBy('first_name', $direction)->orderBy('last_name', $direction)
      ),
      'status', 'report_date' => $query->orderBy($sort, $direction),
      'type' => $query->orderBy(
        ReportAssignment::select('type')->whereColumn('report_assignments.id', 'reports.report_assignment_id'),
        $direction,
      ),
      default => $query->orderBy('id', $direction),
    };
  }
}
