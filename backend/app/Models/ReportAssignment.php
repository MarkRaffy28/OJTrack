<?php

namespace App\Models;

use App\Enums\ReportType;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReportAssignment extends Model {
  use HasFactory, SoftDeletes;

  protected $with = [
    'ojt',
    'creator',
  ];

  public function getFillable(): array {
    return [
      'ojt_id',
      'created_by',
      'title',
      'type',
      'due_at',
      'allow_late_submission',
      'published_at',
    ];
  }

  public function getAppends(): array {
    return [
      'is_published',
      'is_overdue',
    ];
  }

  protected function casts(): array {
    return [
      'type' => ReportType::class,
      'due_at' => 'datetime',
      'allow_late_submission' => 'boolean',
      'published_at' => 'datetime',
    ];
  }

  public function ojt(): BelongsTo {
    return $this->belongsTo(StudentOjt::class, 'ojt_id');
  }

  public function creator(): BelongsTo {
    return $this->belongsTo(User::class, 'created_by');
  }

  public function reports(): HasMany {
    return $this->hasMany(Report::class);
  }

  protected function isPublished(): Attribute {
    return Attribute::make(get: fn() => $this->published_at !== null && $this->published_at->isPast());
  }

  protected function isOverdue(): Attribute {
    return Attribute::make(get: fn() => $this->due_at !== null && $this->due_at->isPast());
  }

  public function scopeFilter(Builder $query, array $filters): void {
    $query
      ->when($filters['ojt_id'] ?? null, fn(Builder $query, $ojtId) =>
        $query->where('ojt_id', $ojtId)
      )
      ->when($filters['created_by'] ?? null, fn(Builder $query, $createdBy) =>
        $query->where('created_by', $createdBy)
      )
      ->when($filters['type'] ?? null, fn(Builder $query, $type) =>
        $query->where('type', $type)
      )
      ->when($filters['title'] ?? null, fn(Builder $query, $title) =>
        $query->where('title', 'like', "%{$title}%")
      )
      ->when(isset($filters['is_published']), fn(Builder $query) =>
        $filters['is_published']
        ? $query->whereNotNull('published_at')->where('published_at', '<=', now())
        : $query->whereNull('published_at')->orWhere('published_at', '>', now())
      );
  }

  public function scopeSort(Builder $query, ?string $sort = 'id', ?string $direction = 'desc'): void {
    $direction = in_array(strtolower($direction ?? 'desc'), ['asc', 'desc']) ? $direction : 'desc';

    match ($sort) {
      'title', 'type', 'due_at', 'published_at' => $query->orderBy($sort, $direction),
      'creator' => $query->whereHas('creator', fn(Builder $q) =>
        $q->orderBy('first_name', $direction)->orderBy('last_name', $direction)
      ),
      default => $query->orderBy('id', $direction),
    };
  }
}
