<?php

namespace App\Rules;

use Illuminate\Validation\Rule;

class OfficeRules {
  public static function name(?int $ignoreOfficeId = null): array {
    return [
      "required",
      "string",
      "max:150",
      Rule::unique("offices", "name")->ignore($ignoreOfficeId),
    ];
  } 

  public static function address(): array {
    return [
      "nullable",
      "string",
      "max:255",
    ];
  }

  public static function contactEmail(): array {
    return [
      "nullable",
      "email",
      "max:150",
    ];
  }

  public static function contactPhone(): array {
    return [
      "nullable",
      "string",
      "max:20",
    ];
  }

  public static function morningIn(): array {
    return [
      "required",
      "date_format:H:i",
    ];
  }

  public static function morningOut(): array {
    return [
      "required",
      "date_format:H:i",
      "after:morning_in",
    ];
  }

  public static function afternoonIn(): array {
    return [
      "required",
      "date_format:H:i",
      "after:morning_out",
    ];
  }

  public static function afternoonOut(): array {
    return [
      "required",
      "date_format:H:i",
      "after:afternoon_in",
    ];
  }
}