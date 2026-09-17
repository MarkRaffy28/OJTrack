<?php

namespace App\Rules;

class AttendanceRules {
  public static function ojtId(): array {
    return [
      "required",
      "integer",
      "exists:student_ojts,id",
    ];  
  }

  public static function qrPayload(): array {
    return ["required", "string"];
  }
}