<?php

namespace App\Rules;

class AuthRules {
  public static function identifier(): array {
    return ["required", "string"];
  }

  public static function password(): array {
    return ["required", "string"];
  }

  public static function currentPassword(): array {
    return ["required", "string", "min:8", "max:255"];
  }

  public static function newPassword(): array {
    return ["required", "string", "min:8", "max:255"];
  }

  public static function confirmPassword(): array {
    return ["required", "string", "min:8", "max:255", "same:newPassword"];
  }

  public static function otp(): array {
    return ["required", "digits:6"];
  }
}
