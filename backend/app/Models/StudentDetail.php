<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property int $id
 * @property int $user_id
 * @property int $year
 * @property string $program
 * @property string $major
 * @property string $section
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentDetail newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentDetail newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentDetail query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentDetail whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentDetail whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentDetail whereMajor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentDetail whereProgram($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentDetail whereSection($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentDetail whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentDetail whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StudentDetail whereYear($value)
 * @mixin \Eloquent
 */
class StudentDetail extends Model {
  protected $fillable = [
    'user_id',
    'year',
    'program',
    'major',
    'section',
  ];

  public function user(): BelongsTo {
    return $this->belongsTo(User::class);
  }

}
