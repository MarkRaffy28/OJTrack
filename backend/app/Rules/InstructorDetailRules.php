<?php

namespace App\Rules;

use App\Enums\AcademicProgram;
use Illuminate\Validation\Rule;

class InstructorDetailRules {
  public static function program(?bool $required = true): array {
    return [
      $required ? "required" : "nullable",
      Rule::enum(AcademicProgram::class),
    ];
  }

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
