<?php

namespace App\Enums;

enum UserRoles: string {
  case STUDENT = 'student';
  case INSTRUCTOR = 'instructor';
  case SUPERVISOR = 'supervisor';
  case ADMIN = 'admin';

  public function label(): string {
    return str($this->name)
      ->lower()
      ->replace('_', ' ')
      ->ucfirst();
  }

  public static function options(): array {
    return array_map(
      fn(self $role) => [
        'label' => $role->label(),
        'value' => $role->value,
      ],
      self::cases(),
    );
  }
}
