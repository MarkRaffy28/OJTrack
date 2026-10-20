<?php

namespace App\Models;

use App\Enums\ActivityAction;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * @property int $id
 * @property int $user_id
 * @property int|null $ojt_id
 * @property ActivityAction $action
 * @property string|null $subject_type
 * @property int|null $subject_id
 * @property string|null $description
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User|null $actor
 * @property-read \App\Models\StudentOjt|null $ojt
 * @property-read Model|\Eloquent|null $subject
 * @method static Builder<static>|Activity filter(array $filters)
 * @method static Builder<static>|Activity sort(?string $sort = 'created_at', ?string $direction = 'desc')
 * @method static Builder<static>|Activity newModelQuery()
 * @method static Builder<static>|Activity newQuery()
 * @method static Builder<static>|Activity query()
 * @method static Builder<static>|Activity whereAction($value)
 * @method static Builder<static>|Activity whereCreatedAt($value)
 * @method static Builder<static>|Activity whereDescription($value)
 * @method static Builder<static>|Activity whereId($value)
 * @method static Builder<static>|Activity whereOjtId($value)
 * @method static Builder<static>|Activity whereSubjectId($value)
 * @method static Builder<static>|Activity whereSubjectType($value)
 * @method static Builder<static>|Activity whereUpdatedAt($value)
 * @method static Builder<static>|Activity whereUserId($value)
 * @mixin \Eloquent
 */
class Activity extends Model {
  protected $fillable = [
    'user_id',
    'ojt_id',
    'action',
    'subject_id',
    'subject_type',
    'description',
  ];

  protected function casts(): array {
    return [
      'action' => ActivityAction::class,
    ];
  }

  public function scopeFilter(Builder $query, array $filters): void {
    $query
      ->when($filters['user_id'] ?? null, function (Builder $query, $userId) {
        $query->where('user_id', $userId);
      })
      ->when($filters['ojt_id'] ?? null, function (Builder $query, $ojtId) {
        $query->where('ojt_id', $ojtId);
      })
      ->when($filters['action'] ?? null, function (Builder $query, $action) {
        $query->where('action', $action);
      })
      ->when($filters['date_range'] ?? null, function (Builder $query, string $dateRange) {
        if (str_contains($dateRange, ' to ')) {
          [$startDate, $endDate] = explode(' to ', $dateRange);
          $query->whereBetween('created_at', [trim($startDate) . ' 00:00:00', trim($endDate) . ' 23:59:59']);
        } else {
          $query->whereDate('created_at', trim($dateRange));
        }
      });
  }

  public function scopeSort(Builder $query, ?string $sort = 'created_at', ?string $direction = 'desc'): void {
    $direction = in_array(strtolower($direction ?? 'desc'), ['asc', 'desc']) ? $direction : 'desc';

    match ($sort) {
      'action' => $query->orderBy('action', $direction),
      'user' => $query->whereHas('actor', fn(Builder $q) =>
        $q->orderBy('first_name', $direction)->orderBy('last_name', $direction)
      ),
      'created_at' => $query->orderBy('created_at', $direction),
      default => $query->orderBy('created_at', $direction),
    };
  }

  public function actor(): BelongsTo {
    return $this->belongsTo(User::class, 'user_id');
  }

  public function ojt(): BelongsTo {
    return $this->belongsTo(StudentOjt::class, 'ojt_id');
  }

  public function subject(): MorphTo {
    return $this->morphTo();
  }
}