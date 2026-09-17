<?php

namespace App\Models;

use App\Enums\OjtStatus;
use App\Enums\OjtTerm;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class StudentOjt extends Model {
  use SoftDeletes;

  protected $fillable = [
    'student_id',
    'supervisor_id',
    'office_id',
    'academic_year',
    'term',
    'required_hours',
    'status',
    'start_date',
    'end_date',
  ];

  protected $casts = [
    'required_hours' => 'decimal:2',
    'start_date' => 'date',
    'end_date' => 'date',
    'term' => OjtTerm::class,
    'status' => OjtStatus::class,
  ];

  public function student(): BelongsTo {
    return $this->belongsTo(User::class, 'student_id');
  }

  public function supervisor(): BelongsTo {
    return $this->belongsTo(User::class, 'supervisor_id');
  }

  public function office(): BelongsTo {
    return $this->belongsTo(Office::class, 'office_id');
  }

  public function attendances(): HasMany {
    return $this->hasMany(Attendance::class, 'ojt_id');
  }

  public function evaluation(): HasOne {
    return $this->hasOne(Evaluation::class);
  }

  public function getRenderedHoursAttribute(): float {
    return round($this->attendances->sum(function (Attendance $attendance): float {
      return $attendance->approved_hours;
    }), 2);
  }

  private function sessionHours(mixed $timeIn, mixed $timeOut): float {
    if (!$timeIn || !$timeOut) {
      return 0.0;
    }

    $start = Carbon::parse((string) $timeIn);
    $end = Carbon::parse((string) $timeOut);

    return $end->lessThan($start)
      ? 0.0
      : round($end->diffInMinutes($start) / 60, 2);
  }

  public function getProgressPercentAttribute(): float {
    if ((float) $this->required_hours <= 0) {
      return 0;
    }

    return min(100, round(($this->rendered_hours / (float) $this->required_hours) * 100, 1));
  }
}
