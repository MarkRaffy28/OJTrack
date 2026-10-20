<?php

namespace App\Enums;

enum AcademicProgram: string {
  case BSIT = "BS Information Technology";
  case BSIS = "BS Information Systems";

  public function label(): string {
    return str($this->value);
  }

  public static function options(?array $only = null): array {
    $cases = self::cases();

    if ($only !== null) {
      $cases = array_filter(
        $cases,
        fn(self $program) => in_array($program, $only, true) || in_array($program->value, $only, true)
      );
    }

    return array_map(
      fn(self $program) => [
        'label' => $program->label(),
        'value' => $program->value,
      ],
      array_values($cases)
    );
  }
}