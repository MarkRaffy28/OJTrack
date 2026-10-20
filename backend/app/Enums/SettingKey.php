<?php

namespace App\Enums;

enum SettingKey: string {
  case ACADEMIC_YEAR = 'academic_year';
  case TERM = 'term';
  case REQUIRED_HOURS = 'required_hours';
  case START_DATE = 'start_date';
  case END_DATE = 'end_date';
  case ALLOWED_ATTENDANCE_DATES = 'allowed_attendance_dates';
  case EVALUATION_OPEN = 'evaluation_open';
  case EVALUATION_TRIGGER_DAYS = 'evaluation_trigger_days';
  case BACKUP_INTERVAL = 'backup_interval';
  case REPORT_TEMPLATE_DAILY = 'report_template_daily';
  case REPORT_TEMPLATE_WEEKLY = 'report_template_weekly';
  case REPORT_TEMPLATE_MONTHLY = 'report_template_monthly';
  case REPORT_TEMPLATE_TERMINAL = 'report_template_terminal';
  // Kept for compatibility with databases created before criteria moved to its own table.
  case EVALUATION_CRITERIA = 'evaluation_criteria';

  public static function options(): array {
    return array_map(fn($case) => [
      'value' => $case->value,
      'label' => str($case->value)->replace('_', ' ')->title(),
    ], self::cases());
  }
}
