<?php

namespace App\Models;

use App\Enums\ReportStatus;
use App\Enums\ReportType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Report extends Model {
  use HasFactory, SoftDeletes;

  protected $fillable = [
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

  protected function casts(): array {
    return [
      'type' => ReportType::class,
      'status' => ReportStatus::class,
      'document_paths' => 'array',
      'report_date' => 'date:Y-m-d',
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
}
