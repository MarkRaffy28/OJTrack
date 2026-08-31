<?php

namespace App\Rules;

use App\Rules\CommonRules;

class EmergencyContactsRules {
  public static function emergencyContact(): array {
    return ["required", "array"];
  }
  public static function name(): array {
    return ["required", "string", "max:210"];
  }

  public static function relationship(): array {
    return ["required", "string", "max:50"];
  }

  public static function contactNumber(): array {
    return CommonRules::contactNumber();
  }

  public static function address(): array {
    return CommonRules::address();
  }

  public static function isPrimary(): array {
    return ["required", "boolean"];
  }
}