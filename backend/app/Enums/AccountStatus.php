<?php

namespace App\Enums;

enum AccountStatus: string {
  case PRE_ACTIVATED = 'pre_activated';
  case ACTIVE = 'active';
  case SUSPENDED = 'suspended';

  public function label(): string {
    return str($this->name)
      ->lower()
      ->replace('_', ' ')
      ->ucfirst();
  }

  public static function options(): array {
    return array_map(
      fn(self $status) => [
        'label' => $status->label(),
        'value' => $status->value,
      ],
      self::cases(),
    );
  }
}