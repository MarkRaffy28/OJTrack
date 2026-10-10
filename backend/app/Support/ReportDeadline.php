<?php

namespace App\Support;

use App\Enums\ReportType;
use Carbon\Carbon;

class ReportDeadline {
  public static function resolve(ReportType|string $type, string|Carbon $reportDate, ?array $configured = null): ?string {
    $value = $type instanceof ReportType ? $type->value : $type;
    $configuredDeadline = $configured[$value] ?? null;

    if ($configuredDeadline) {
      return Carbon::parse($configuredDeadline)->toDateString();
    }

    $date = Carbon::parse($reportDate);

    return match ($value) {
      ReportType::DAILY->value => $date->addDay()->toDateString(),
      ReportType::WEEKLY->value => $date->addWeek()->toDateString(),
      ReportType::MONTHLY->value => $date->addMonth()->toDateString(),
      default => null,
    };
  }
}
