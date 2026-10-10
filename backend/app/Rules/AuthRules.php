<?php

namespace App\Rules;

class AuthRules {
  public static function identifier(): array {
    return ["required", "string"];
  }

  public static function password(?bool $required = true): array {
    return [
      $required ? "required" : "nullable",
      'string',
      "min:8",
      "max:255"
    ];
  }
  public static function currentPassword(?bool $required = true): array {
    return [
      $required ? "required" : "nullable",
      'string',
      "min:8",
      "max:255"
    ];
  }
  public static function newPassword(?bool $required = true): array {
    return [
      $required ? "required" : "nullable",
      'string',
      "min:8",
      "max:255"
    ];
  }

  public static function confirmPassword(?bool $required = true): array {
    return [
      $required ? "required" : "nullable",
      'string',
      "min:8",
      "max:255",
      "same:newPassword"
    ];
  }

  public static function otp(): array {
    return ["required", "digits:6"];
  }
}
