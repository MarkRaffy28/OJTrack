<?php

namespace App\Models;

use App\Enums\EvaluationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $student_ojt_id
 * @property int $evaluator_id
 * @property array<array-key, mixed>|null $criteria_scores
 * @property string|null $remarks
 * @property int $total_points
 * @property EvaluationStatus $status
 * @property \Illuminate\Support\Carbon|null $submitted_at
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
    'criteria_scores',
    'student_ojt_id',
    'evaluator_id',
    'remarks',
    'total_points',
    'status',
    'submitted_at',
  ];

  protected $casts = [
    'criteria_scores' => 'array',
    'status' => EvaluationStatus::class,
    'submitted_at' => 'datetime',
  ];

  public function studentOjt(): BelongsTo {
    return $this->belongsTo(StudentOjt::class);
  }
}
