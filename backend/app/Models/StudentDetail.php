<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class StudentDetail extends Model {
  protected $fillable = [
    'user_id',
    'instructor_detail_id',
    'office_id',
    'year',
    'program',
    'major',
    'section',
  ];

  public function user(): BelongsTo {
    return $this->belongsTo(User::class);
  }

  public function instructorDetail(): BelongsTo {
    return $this->belongsTo(InstructorDetail::class);
  }

  public function office(): BelongsTo {
    return $this->belongsTo(Office::class);
  }
}