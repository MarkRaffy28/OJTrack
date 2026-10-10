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
      ->title();
  }

  public static function options(?array $only = null): array {
    $cases = self::cases();

    if ($only !== null) {
      $cases = array_filter(
        $cases,
        fn(self $status) => in_array($status, $only, true) || in_array($status->value, $only, true)
      );
    }

    return array_map(
      fn(self $status) => [
        'label' => $status->label(),
        'value' => $status->value,
      ],
      array_values($cases)
    );
  }

  public function badgeClass(): string {
    return match ($this) {
      self::ACTIVE => 'bg-success-50 text-success-700',
      self::SUSPENDED => 'bg-danger-50 text-danger-700',
      default => 'bg-slate-100 text-text-muted',
    };
  }
}
