<?php

namespace App\Rules;

use App\Enums\AccountStatus;
use App\Enums\UserRoles;
use App\Rules\CommonRules;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UserRules {
  public static function username(?bool $required = true, ?int $ignoreUserId = null): array {
    return [
      $required ? "required" : "nullable",
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
      Rule::unique("users", "user_id")->ignore($ignoreUserId)
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

  public static function birthDate(?bool $required = true): array {
    return [$required ? "required" : "nullable", "date"];
  }

  public static function gender(?bool $required = true): array {
    return [$required ? "required" : "nullable", "in:Male,Female,Other"];
  }

  public static function homeAddress(?bool $required = true): array {
    return CommonRules::address($required);
  }

  public static function presentAddress(?bool $required = true): array {
    return CommonRules::address($required);
  }

  public static function contactNumber(?bool $required = true): array {
    return CommonRules::contactNumber($required);
  }

  public static function email(?bool $required = true, ?int $ignoreUserId = null): array {
    return [
      $required ? "required" : "nullable",
      "email",
      "max:100",
      Rule::unique("users", "email")->ignore($ignoreUserId)
    ];
  }
  
  public static function role(): array {
    return ["required", new Enum(UserRoles::class)];
  }

  public static function status(): array {
    return ["required", new Enum(AccountStatus::class)];
  }

}