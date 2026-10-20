<?php

namespace App\Enums;

enum ReportType: string {
  case DAILY = 'daily';
  case WEEKLY = 'weekly';
  case MONTHLY = 'monthly';
  case TERMINAL = 'terminal';

  public static function options(): array {
    return array_map(
      fn(self $type) => [
        "value" => $type->value,
        "label" => ucfirst($type->value),
      ],
      self::cases()
    );
  }
}
