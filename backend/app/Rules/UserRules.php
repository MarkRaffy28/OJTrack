<?php

namespace App\Rules;

use App\Rules\CommonRules;
use Illuminate\Validation\Rule;

class UserRules {
  public static function username(?int $ignoreUserId = null): array {
    return [
      "required",
      "string",
      "max:100",
      Rule::unique("users", "username")->ignore($ignoreUserId)
    ];
  }

  public static function profilePicture(?bool $required = false): array {
    return [
      $required ? "required" : "nullable",
      "file",
      "image",
      "mimes:jpeg,jpg,png,webp",
      "max:5120",
    ];
  }

  public static function userId(?int $ignoreUserId = null): array {
    return [
      "required",
      "string",
      "max:50",
      Rule::unique("users", "userId")->ignore($ignoreUserId)
    ];
  }

  public static function firstName(): array {
    return ["required", "string", "max:100"];
  }

  public static function middleName(): array {
    return ["nullable", "string", "max:50"];
  }

  public static function lastName(): array {
    return ["required", "string", "max:50"];
  }

  public static function extensionName(): array {
    return ["nullable", "string", "max:10"];
  }

  public static function birthDate(): array {
    return ["required", "date"];
  }

  public static function gender(): array {
    return ["required", "in:Male,Female,Other"];
  }

  public static function homeAddress(): array {
    return CommonRules::address();
  }

  public static function presentAddress(): array {
    return CommonRules::address();
  }

  public static function contactNumber(): array {
    return CommonRules::contactNumber();
  }

  public static function email(?int $ignoreUserId = null): array {
    return [
      "required",
      "email",
      "max:100",
      Rule::unique("users", "email")->ignore($ignoreUserId)
    ];
  }
}