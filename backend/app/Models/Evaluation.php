<?php

namespace App\Models;

use App\Enums\EvaluationStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $student_ojt_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\StudentOjt|null $studentOjt
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Evaluation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Evaluation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Evaluation query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Evaluation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Evaluation whereCriteriaScores($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Evaluation whereEvaluatorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Evaluation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Evaluation whereRemarks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Evaluation whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Evaluation whereStudentOjtId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Evaluation whereSubmittedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Evaluation whereTotalPoints($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Evaluation whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class Evaluation extends Model {
  protected $fillable = [
    'student_ojt_id',
  ];

  public function studentOjt(): BelongsTo {
    return $this->belongsTo(StudentOjt::class);
  }

  public function details(): HasMany {
    return $this->hasMany(EvaluationDetail::class);
  }

  public function scopeFilter(Builder $query, array $filters): void {
    $query
      ->when($filters['student_id'] ?? null, function (Builder $query, $studentId) {
        $query->whereHas('studentOjt', fn(Builder $q) => $q->where('student_id', $studentId));
      })
      ->when($filters['office_id'] ?? null, function (Builder $query, $officeId) {
        $query->whereHas('studentOjt', fn(Builder $q) => $q->where('office_id', $officeId));
      })
      ->when($filters['status'] ?? null, fn(Builder $query, $status) =>
        $query->where('status', $status)
      );
  }

  public function scopeSort(Builder $query, ?string $sort = 'id', ?string $direction = 'desc'): void {
    $direction = in_array(strtolower($direction ?? 'desc'), ['asc', 'desc']) ? $direction : 'desc';

    match ($sort) {
      'student' => $query->whereHas('studentOjt', fn(Builder $q) =>
        $q->whereHas('student', fn(Builder $sub) =>
          $sub->orderBy('first_name', $direction)->orderBy('last_name', $direction)
        )
      ),
      'office' => $query->whereHas('studentOjt', fn(Builder $q) =>
        $q->whereHas('office', fn(Builder $sub) =>
          $sub->orderBy('name', $direction)
        )
      ),
      'supervisor' => $query->whereHas('studentOjt', fn(Builder $q) =>
        $q->whereHas('supervisor', fn(Builder $sub) =>
          $sub->orderBy('first_name', $direction)->orderBy('last_name', $direction)
        )
      ),
      'total_points', 'status' => $query->orderBy($sort, $direction),
      default => $query->orderBy('id', $direction),
    };
  }
}
