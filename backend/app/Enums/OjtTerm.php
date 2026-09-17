<?php

namespace App\Enums;

enum OjtTerm: string {
  case FIRST = "1st";
  case SECOND = "2nd";
  case SUMMER = "Summer";

  public static function options(): array {
    return array_map(
      fn(self $term) => [
        "value" => $term->value,
        "label" => $term->value,
      ],
      self::cases()
    );
  }
}