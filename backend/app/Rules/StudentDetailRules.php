<?php

namespace App\Rules;

class StudentDetailRules {
  public static function year(?bool $required = true): array {
    return [
      $required ? "required" : "nullable",
      'integer',
      'min:1',
      'max:5'
    ];
  }

  public static function program(?bool $required = true): array {
    return [
      $required ? "required" : "nullable",
      'string', 
      'max:100'
    ];
  }

  public static function major(?bool $required = true): array {
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