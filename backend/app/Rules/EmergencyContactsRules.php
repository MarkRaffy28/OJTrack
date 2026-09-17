<?php

namespace App\Rules;

use App\Rules\CommonRules;

class EmergencyContactsRules {
  public static function emergencyContact(?bool $required = true): array {
    return [
      $required ? "required" : "nullable",
      "array"
    ];
  }
  public static function name(?bool $required = true): array {
    return [
      $required ? "required" : "nullable",
      "string",
      "max:210"
    ];
  }

  public static function relationship(?bool $required = true): array {
    return [
      $required ? "required" : "nullable",
      "string",
      "max:50"
    ];
  }

  public static function contactNumber(?bool $required = true): array {
    return CommonRules::contactNumber($required);
  }

  public static function address(?bool $required = true): array {
    return CommonRules::address($required);
  }

  public static function isPrimary(?bool $required = true): array {
    return [
      $required ? "required" : "nullable",
      "boolean"
    ];
  }
}