<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InstructorDetail extends Model {
  protected $fillable = [
    'user_id',
    'department',
    'section',
  ];

  public function user(): BelongsTo {
    return $this->belongsTo(User::class);
  }
}