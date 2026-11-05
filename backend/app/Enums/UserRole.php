<?php

namespace App\Enums;

enum UserRole: string {
  case STUDENT = 'student';
  case INSTRUCTOR = 'instructor';
  case SUPERVISOR = 'supervisor';
  case ADMIN = 'admin';
  case SUPER_ADMIN = 'super-admin';

  public function label(): string {
    return str($this->name)
      ->lower()
      ->replace('_', ' ')
      ->ucwords();
  }

  public function class(): string {
    return match ($this) {
      self::STUDENT => 'bg-info-50 text-info-600',
      self::INSTRUCTOR => 'bg-primary-50 text-primary-700',
      self::SUPERVISOR => 'bg-warning-50 text-warning-700',
      self::ADMIN => 'bg-success-50 text-success-700',
      self::SUPER_ADMIN => 'bg-danger-50 text-danger-700',
    };
  }

  public static function options(?array $only = null): array {
    $cases = self::cases();

    if ($only !== null) {
      $cases = array_filter(
        $cases,
        fn(self $role) => in_array($role, $only, true) || in_array($role->value, $only, true)
      );
    }

    return array_map(
      fn(self $role) => [
        'label' => $role->label(),
        'value' => $role->value,
      ],
      array_values($cases)
    );
  }
}
