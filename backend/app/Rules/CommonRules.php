<?php

namespace App\Rules;

class CommonRules {
  public static function address(?bool $required = true): array {
    return [$required ? "required" : "nullable", "string", "max:255"];
  }

  public static function contactNumber(?bool $required = true): array {
    return [$required ? "required" : "nullable", "string", "max:15"];
  }
}