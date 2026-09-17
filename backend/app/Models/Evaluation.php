<?php

namespace App\Models;

use App\Enums\EvaluationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Evaluation extends Model {
  protected $fillable = [
    'student_ojt_id',
    'quality',
    'productivity',
    'initiative',
    'time_management_punctuality',
    'proper_attire_grooming',
    'remarks',
    'total_points',
    'status',
    'submitted_at',
  ];

  protected $casts = [
    'status' => EvaluationStatus::class,
    'submitted_at' => 'datetime',
  ];

  public function studentOjt(): BelongsTo {
    return $this->belongsTo(StudentOjt::class);
  }
}