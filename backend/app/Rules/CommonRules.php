<?php

namespace App\Rules;

class CommonRules {
  public static function address(): array {
    return ["required", "string", "max:255"];
  }

  public static function contactNumber(): array {
    return ["required", "string", "max:15"];
  }
}