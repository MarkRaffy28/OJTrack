<?php

namespace App\Enums;

enum ReportStatus: string {
  case PENDING = "pending";
  case APPROVED = "approved";
  case REJECTED = "rejected";
  
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