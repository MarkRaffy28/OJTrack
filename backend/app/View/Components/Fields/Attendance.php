<?php

namespace App\View\Components\Fields;

use App\Enums\FieldMode;
use App\Enums\Fields\AttendanceField;

class Attendance extends BaseField {
  public function __construct(
    string|AttendanceField $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public mixed $value = null,
    public array $options = [],
    public ?bool $required = null,
    public ?bool $disabled = null,
  ) {
    $this->fieldEnum = $this->parseEnum($field, AttendanceField::class);
    $this->mode = $this->parseMode($mode);
  }

  public function config(): array {
    $config = match ($this->fieldEnum) {
      AttendanceField::STUDENT_ID => ['id' => 'student_id', 'name' => 'student_id', 'label' => 'Student', 'icon' => 'person', 'type' => 'select', 'searchable' => true, 'required' => true],
      AttendanceField::OJT_ID => ['id' => 'ojt_id', 'name' => 'ojt_id', 'label' => 'Student OJT Assignment', 'icon' => 'assignment', 'type' => 'select', 'searchable' => true, 'required' => true],
      AttendanceField::DATE => ['id' => 'date', 'name' => 'date', 'label' => 'Date', 'icon' => 'calendar_today', 'type' => 'date', 'required' => true],
    };

    if ($this->options) $config['options'] = $this->options;
    if ($this->required !== null) $config['required'] = $this->required;
    if ($this->disabled !== null) $config['disabled'] = $this->disabled;

    return $config;
  }

  protected function resolveValue(): mixed {
    return $this->value;
  }

  public function disabled(): bool {
    return $this->disabled ?? parent::disabled();
  }
}
