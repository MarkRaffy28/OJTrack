<?php

namespace App\Rules;

class InstructorDetailRules {
  public static function department(?bool $required = true): array {
    return [
      $required ? "required" : "nullable", 
    'string', 
    'max:100'
  ];
  }

  public static function section(?bool $required = true): array {
    return [
      $required ? "required" : "nullable", 
    'string', 
    'max:10'
  ];
  }
}