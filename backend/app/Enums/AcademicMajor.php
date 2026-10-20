<?php

namespace App\Enums;

enum AcademicMajor: string {
  case WMD = "Web and Mobile Development";
  case CSN = "Cybersecurity and Networking";

  public function label(): string {
    return str($this->value);
  }

  public static function options(?array $only = null): array {
    $cases = self::cases();

    if ($only !== null) {
      $cases = array_filter(
        $cases,
        fn(self $major) => in_array($major, $only, true) || in_array($major->value, $only, true)
      );
    }

    return array_map(
      fn(self $major) => [
        'label' => $major->label(),
        'value' => $major->value,
      ],
      array_values($cases)
    );
  }
}