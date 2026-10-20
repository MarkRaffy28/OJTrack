<?php

namespace App\View\Components\Fields;

use App\Enums\FieldMode;
use App\Enums\SettingKey;

class Setting extends BaseField {
  public function __construct(
    string|SettingKey $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public mixed $value = null,
    public array $options = [],
    public ?bool $required = null,
    public ?bool $disabled = null,
  ) {
    $this->fieldEnum = $this->parseEnum($field, SettingKey::class);
    $this->mode = $this->parseMode($mode);
  }

  public function config(): ?array {
    $baseConfig = match ($this->fieldEnum) {
      SettingKey::ACADEMIC_YEAR => [
        'id' => 'academic_year',
        'name' => 'settings[academic_year]',
        'label' => 'Academic Year',
        'icon' => 'school',
        'type' => 'text',
        'required' => true,
      ],
      SettingKey::TERM => [
        'id' => 'term',
        'name' => 'settings[term]',
        'label' => 'Term',
        'icon' => 'event',
        'type' => 'select',
        'options' => [
          ['value' => '1st', 'label' => '1st'],
          ['value' => '2nd', 'label' => '2nd'],
          ['value' => 'Summer', 'label' => 'Summer'],
        ],
        'required' => true,
      ],
      SettingKey::REQUIRED_HOURS => [
        'id' => 'required_hours',
        'name' => 'settings[required_hours]',
        'label' => 'Required Hours',
        'icon' => 'schedule',
        'type' => 'number',
        'required' => true,
      ],
      SettingKey::START_DATE => [
        'id' => 'start_date',
        'name' => 'settings[start_date]',
        'label' => 'Start Date',
        'icon' => 'calendar_today',
        'type' => 'date',
        'required' => true,
      ],
      SettingKey::END_DATE => [
        'id' => 'end_date',
        'name' => 'settings[end_date]',
        'label' => 'End Date',
        'icon' => 'event',
        'type' => 'date',
        'required' => true,
      ],
      SettingKey::EVALUATION_OPEN => [
        'id' => 'evaluation_open',
        'name' => 'settings[evaluation_open]',
        'label' => 'Evaluation Open',
        'icon' => 'event',
        'type' => 'boolean',
        'required' => true,
      ],
      SettingKey::EVALUATION_TRIGGER_DAYS => [
        'id' => 'evaluation_trigger_days',
        'name' => 'settings[evaluation_trigger_days]',
        'label' => 'Evaluation Trigger Days',
        'icon' => 'event',
        'type' => 'number',
        'required' => true,
      ],
      SettingKey::BACKUP_INTERVAL => [
        'id' => 'backup_interval',
        'name' => 'settings[backup_interval]',
        'label' => 'Automatic Backup Interval',
        'icon' => 'backup',
        'type' => 'select',
        'options' => [
          ['value' => 'disabled', 'label' => 'Disabled'],
          ['value' => 'hourly', 'label' => 'Every hour'],
          ['value' => 'daily', 'label' => 'Every day'],
          ['value' => 'weekly', 'label' => 'Every week'],
        ],
        'required' => true,
      ],
    };

    if (!empty($this->options)) {
      $baseConfig['options'] = $this->options;
    }

    if ($this->required !== null) {
      $baseConfig['required'] = $this->required;
    }

    if ($this->disabled !== null) {
      $baseConfig['disabled'] = $this->disabled;
    }

    return $baseConfig;
  }

  /**
   * Provide raw value for the BaseField resolution pipeline.
   */
  protected function resolveValue(): mixed {
    return $this->value;
  }

  public function disabled(): bool {
    return $this->disabled ?? parent::disabled();
  }
}
