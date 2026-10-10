<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property string $name
 * @property string $relationship
 * @property string $contact_number
 * @property string $address
 * @property bool $is_primary
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmergencyContact newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmergencyContact newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmergencyContact query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmergencyContact whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmergencyContact whereContactNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmergencyContact whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmergencyContact whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmergencyContact whereIsPrimary($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmergencyContact whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmergencyContact whereRelationship($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmergencyContact whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmergencyContact whereUserId($value)
 * @mixin \Eloquent
 */
class EmergencyContact extends Model {
  protected $fillable = [
    'user_id',
    'name',
    'relationship',
    'contact_number',
    'address',
    'is_primary',
  ];

  protected function casts(): array {
    return [
      'is_primary' => 'boolean',
    ];
  }

  public function user(): BelongsTo {
    return $this->belongsTo(User::class);
  }
}
