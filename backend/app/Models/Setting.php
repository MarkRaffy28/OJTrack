<?php

namespace App\Models;

use App\Enums\SettingKey;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model {
  protected $fillable = [
    'setting_key',
    'setting_value',
  ];

  protected $casts = [
    'setting_key' => SettingKey::class,
  ];
}