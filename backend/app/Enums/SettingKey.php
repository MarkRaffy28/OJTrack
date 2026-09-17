<?php

namespace App\Enums;

enum SettingKey: string {
  case ACADEMIC_YEAR = 'academic_year';
  case TERM = 'term';
  case REQUIRED_HOURS = 'required_hours';
  case START_DATE = 'start_date';
  case END_DATE = 'end_date';
  case EVALUATION_OPEN = 'evaluation_open';
  case EVALUATION_TRIGGER_DAYS = 'evaluation_trigger_days';

  public static function options(): array {
    return array_map(fn($case) => [
      'value' => $case->value,
      'label' => str($case->value)->replace('_', ' ')->title(),
    ], self::cases());
  }
}