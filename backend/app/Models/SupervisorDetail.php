<?php

namespace App\Models;

use App\Models\Office;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupervisorDetail extends Model {
  protected $fillable = [
    'user_id',
    'office_id',
    'position',
  ];

  public function user(): BelongsTo {
    return $this->belongsTo(User::class);
  }

  public function office(): BelongsTo {
    return $this->belongsTo(Office::class);
  }
}