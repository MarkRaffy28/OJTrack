<?php

namespace App\Rules;

use App\Enums\SettingKey;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class SettingRules {
  public static function settingValue(string $key): array {
    return match ($key) {
      SettingKey::ACADEMIC_YEAR->value => [
        'required',
        'string',
        'max:20',
      ],
      SettingKey::TERM->value => [
        'required',
        Rule::enum(\App\Enums\OjtTerm::class),
      ],
      SettingKey::REQUIRED_HOURS->value => [
        'required',
        'numeric',
        'min:0.01',
        'max:999.99',
      ],
      SettingKey::START_DATE->value => [
        'required',
        'date',
      ],
      SettingKey::END_DATE->value => [
        'required',
        'date',
      ],
      SettingKey::ALLOWED_ATTENDANCE_DATES->value => [
        'required',
        'json',
        function (string $attribute, mixed $value, \Closure $fail): void {
          $dates = json_decode((string) $value, true);
          if (!is_array($dates) || array_values($dates) !== $dates) {
            $fail('Allowed attendance dates must be a JSON array.');
            return;
          }

          foreach ($dates as $date) {
            if (!is_string($date) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
              $fail('Allowed attendance dates must use the YYYY-MM-DD format.');
              return;
            }
            try {
              $parsed = Carbon::createFromFormat('!Y-m-d', $date);
              if (!$parsed || $parsed->format('Y-m-d') !== $date || $parsed->isWeekend()) {
                $fail('Allowed attendance dates must be valid weekdays.');
                return;
              }
            } catch (\Throwable) {
              $fail('Allowed attendance dates must be valid weekdays.');
              return;
            }
          }
        },
      ],
      SettingKey::BACKUP_INTERVAL->value => [
        'required',
        Rule::in(['disabled', 'hourly', 'daily', 'weekly']),
      ],
      SettingKey::REPORT_TEMPLATE_DAILY->value,
      SettingKey::REPORT_TEMPLATE_WEEKLY->value,
      SettingKey::REPORT_TEMPLATE_MONTHLY->value,
      SettingKey::REPORT_TEMPLATE_TERMINAL->value => [
        'nullable', 'file', 'mimes:doc,docx', 'max:10240',
      ],
      default => [
        'required',
        'string',
      ],
    };
  }
}
