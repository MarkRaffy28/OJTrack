<?php

namespace App\Rules;

use App\Enums\SettingKey;
use Illuminate\Validation\Rule;

class SettingRules {
  public static function settingValue(string $key): array {
    return match ($key) {
      SettingKey::ACADEMIC_YEAR->value => [
        'required',
        'string',
        'max:20',
      ],
      SettingKey::TERM->value => [
        'required',
        Rule::enum(\App\Enums\OjtTerm::class),
      ],
      SettingKey::REQUIRED_HOURS->value => [
        'required',
        'numeric',
        'min:0.01',
        'max:999.99',
      ],
      SettingKey::START_DATE->value => [
        'required',
        'date',
      ],
      SettingKey::END_DATE->value => [
        'required',
        'date',
      ],
      default => [
        'required',
        'string',
      ],
    };
  }
}