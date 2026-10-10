<?php

namespace App\Models;

use App\Models\Office;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property int $office_id
 * @property string $position
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read Office $office
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupervisorDetail newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupervisorDetail newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupervisorDetail query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupervisorDetail whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupervisorDetail whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupervisorDetail whereOfficeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupervisorDetail wherePosition($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupervisorDetail whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SupervisorDetail whereUserId($value)
 * @mixin \Eloquent
 */
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
