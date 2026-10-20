<?php

namespace App\Enums;

enum EvaluationStatus: string {
  case DRAFT = 'draft';
  case SUBMITTED = 'submitted';
  case FINALIZED = 'finalized';

  public static function options(): array {
    return array_map(
      fn(self $status) => [
        "value" => $status->value,
        "label" => ucwords($status->value),
      ],
      self::cases()
    );
  }
}
