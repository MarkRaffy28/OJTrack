<?php

namespace App\Rules;

use App\Enums\ReportStatus;
use App\Enums\ReportType;
use Illuminate\Validation\Rule;

class ReportRules {
  public static function studentId(): array {
    return [
      "required",
      "integer",
      Rule::exists("users", "id"),
    ];
  }

  public static function ojtId(): array {
    return [
      "required",
      "integer",
      "exists:student_ojts,id",
    ];
  }

  public static function type(): array {
    return [
      "required",
      Rule::enum(ReportType::class),
    ];
  }

  public static function reportDate(): array {
    return [
      "required",
      "date",
    ];
  }

  public static function documentPaths(): array {
    return [
      "nullable",
      "array",
      "max:3",
    ];
  }

  public static function documentPath(): array {
    return [
      "file",
      "extensions:pdf",
      "max:10240",
    ];
  }

  public static function status(): array {
    return [
      "required",
      Rule::enum(ReportStatus::class),
    ];
  }

  public static function reviewedBy(): array {
    return [
      "nullable",
      "integer",
      Rule::exists("users", "id"),
    ];
  }

  public static function reviewedAt(): array {
    return [
      "nullable",
      "date",
    ];
  }

  public static function feedback(): array {
    return [
      "nullable",
      "string",
      "max:5000",
    ];
  }
}