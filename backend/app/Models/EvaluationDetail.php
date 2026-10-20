<?php

namespace App\Models;

use App\Enums\EvaluationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EvaluationDetail extends Model {
  protected $fillable = [
    'evaluation_id', 'evaluator_id', 'evaluation_type', 'period',
    'criteria_scores', 'remarks', 'total_points', 'status', 'submitted_at',
  ];

  protected $casts = [
    'criteria_scores' => 'array',
    'status' => EvaluationStatus::class,
    'submitted_at' => 'datetime',
  ];

  public function evaluation(): BelongsTo { return $this->belongsTo(Evaluation::class); }
  public function evaluator(): BelongsTo { return $this->belongsTo(User::class, 'evaluator_id'); }
}
