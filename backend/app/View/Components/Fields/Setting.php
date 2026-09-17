<?php

namespace App\View\Components\Fields;

use App\Enums\FieldMode;
use App\Enums\SettingKey;
use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class Setting extends Component {
  public SettingKey $field;
  public FieldMode $mode;

  public function __construct(
    string|SettingKey $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public mixed $value = null,
    public ?bool $required = null,
    public ?bool $disabled = null,
  ) {
    $this->field = is_string($field) ? SettingKey::from($field) : $field;
    $this->mode = is_string($mode) ? FieldMode::from($mode) : $mode;
  }

  public function config(): ?array {
    return match ($this->field) {
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
    };
  }

  public function disabled(): bool {
    return $this->disabled ?? ($this->mode === FieldMode::VIEW);
  }

  public function readonly(): bool {
    return $this->mode === FieldMode::VIEW;
  }

  public function fieldOptions(): array {
    return $this->config()['options'] ?? [];
  }

  public function fieldValue(): mixed {
    $dotName = 'settings.' . $this->field->value;
    return old($dotName, $this->value);
  }

  public function render(): View|Closure|string {
    return view('components.fields.setting');
  }
}