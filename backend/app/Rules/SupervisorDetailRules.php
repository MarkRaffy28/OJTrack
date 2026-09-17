<?php

namespace App\Rules;

class SupervisorDetailRules {
  public static function officeId(?bool $required = false): array {
    return [
      $required ? "required" : "nullable",
      'integer',
      'exists:offices,id',
    ];
  }

  public static function position(?bool $required = true): array {
    return [
      $required ? "required" : "nullable",
      'string', 
      'max:255'
    ];
  }
}