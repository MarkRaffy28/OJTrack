<?php

namespace App\Rules;

use App\Enums\UserRoles;
use Illuminate\Validation\Rule;

class AssignmentRules {
  public static function studentId(): array {
    return [
      "required",
      "integer",
      Rule::exists("users", "id")->where(fn($query) => $query->where("role", UserRoles::STUDENT->value)),
    ];
  }

  public static function supervisorId(): array {
    return [
      "nullable",
      "integer",
      Rule::exists("users", "id")->where(fn($query) => $query->where("role", UserRoles::SUPERVISOR->value)),
    ];
  }

  public static function officeId(): array {
    return [
      "required",
      "integer",
      "exists:offices,id",
    ];
  }

  public static function academicYear(?int $studentId = null, ?string $term = null, ?int $ignoreStudentOjtId = null): array {
    return [
      "required",
      "string",
      "max:20",
      Rule::unique("student_ojts", "academic_year")
        ->where(fn($query) => $query
          ->where("student_id", $studentId)
          ->where("term", $term)
        )
        ->ignore($ignoreStudentOjtId),
    ];
  }

  public static function requiredHours(): array {
    return [
      "required",
      "numeric",
      "min:0.01",
      "max:999.99",
    ];
  }

  public static function startDate(): array {
    return [
      "required",
      "date",
    ];
  }

  public static function endDate(): array {
    return [
      "required",
      "date",
      "after_or_equal:start_date",
    ];
  }
}