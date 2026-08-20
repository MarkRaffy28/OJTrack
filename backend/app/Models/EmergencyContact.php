<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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