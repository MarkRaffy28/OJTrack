<?php

namespace App\Models;

use App\Enums\ReportStatus;
use App\Enums\ReportType;
use App\Support\ReportDeadline;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property int $student_id
 * @property int $ojt_id
 * @property ReportType $type
 * @property \Illuminate\Support\Carbon $report_date
 * @property array<array-key, mixed>|null $document_paths
 * @property ReportStatus $status
 * @property int|null $reviewed_by
 * @property \Illuminate\Support\Carbon|null $reviewed_at
 * @property string|null $feedback
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read string|null $deadline
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

  /**
   * Get the relationships that should always be eager loaded.
   *
   * @return array<int, string>
   */
  public function getWith(): array {
    return [
      'student',
      'ojt',
      'reviewer',
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
      'type',
      'report_date',
      'document_paths',
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
      'type' => ReportType::class,
      'status' => ReportStatus::class,
      'document_paths' => 'array',
      'report_date' => 'date:Y-m-d',
      'reviewed_at' => 'datetime',
    ];
  }

  /**
   * Resolve the deadline safely without triggering LazyLoadingViolationException.
   */
  protected function deadline(): Attribute {
    return Attribute::make(
      get: function (): ?string {
        if (!$this->report_date) {
          return null;
        }

        $reportDeadlines = $this->relationLoaded('ojt') ? $this->ojt?->report_deadlines : null;

        return ReportDeadline::resolve($this->type, $this->report_date, $reportDeadlines);
      }
    );
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

  public function scopeFilter(Builder $query, array $filters): void {
    $query
      ->when($filters['student_id'] ?? null, fn(Builder $query, $studentId) =>
        $query->where('student_id', $studentId)
      )
      ->when($filters['office_id'] ?? null, function (Builder $query, $officeId) {
        $query->whereHas('ojt', fn(Builder $q) => $q->where('office_id', $officeId));
      })
      ->when($filters['type'] ?? null, fn(Builder $query, $type) =>
        $query->where('type', $type)
      )
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
      'type', 'status', 'report_date' => $query->orderBy($sort, $direction),
      default => $query->orderBy('id', $direction),
    };
  }
}
