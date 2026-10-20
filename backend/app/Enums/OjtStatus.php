<?php

namespace App\Enums;

enum OjtStatus: string {
  case PENDING = "pending";
  case ONGOING = "ongoing";
  case COMPLETED = "completed";
  case DROPPED = "dropped";

  public function label(): string {
    return match($this) {
      self::PENDING => "Pending",
      self::ONGOING => "Ongoing",
      self::COMPLETED => "Completed",
      self::DROPPED => "Dropped",
    };
  }

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
