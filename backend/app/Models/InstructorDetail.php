<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property string $department
 * @property string $section
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InstructorDetail newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InstructorDetail newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InstructorDetail query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InstructorDetail whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InstructorDetail whereDepartment($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InstructorDetail whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InstructorDetail whereSection($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InstructorDetail whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|InstructorDetail whereUserId($value)
 * @mixin \Eloquent
 */
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
