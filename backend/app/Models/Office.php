<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Office extends Model {
  protected $fillable = [
    'name',
    'address',
    'contact_email',
    'contact_phone',
    'morning_in',
    'morning_out',
    'afternoon_in',
    'afternoon_out',
  ];

  public function supervisors(): HasMany {
    return $this->hasMany(SupervisorDetail::class);
  }
}