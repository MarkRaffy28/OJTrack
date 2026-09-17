<?php

namespace App\Enums;

enum OjtStatus: string {
  case PENDING = "pending";
  case ONGOING = "ongoing";
  case COMPLETED = "completed";
  case DROPPED = "dropped";

  public static function options(): array {
    return array_map(
      fn(self $status) => [
        "value" => $status->value,
        "label" => ucfirst($status->value),
      ],
      self::cases()
    );
  }
}