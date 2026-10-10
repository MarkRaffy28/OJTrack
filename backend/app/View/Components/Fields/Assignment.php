<?php

namespace App\View\Components\Fields;

use App\Enums\FieldMode;
use App\Enums\Fields\AssignmentField;
use App\Enums\OjtStatus;

class Assignment extends BaseField {
  public function __construct(
    string|AssignmentField $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public mixed $value = null,
    public array $options = [],
    public ?bool $required = null,
    public ?bool $disabled = null,
  ) {
    $this->fieldEnum = $this->parseEnum($field, AssignmentField::class);
    $this->mode = $this->parseMode($mode);
  }

  public function config(): ?array {
    $baseConfig = match ($this->fieldEnum) {
      AssignmentField::STUDENT_ID => [
        'id' => 'student_id',
        'name' => 'student_id',
        'label' => 'Student',
        'icon' => 'person',
        'type' => 'select',
        'searchable' => true,
        'required' => true,
      ],
      AssignmentField::OJT_ID => [
        'id' => 'ojt_id', 'name' => 'ojt_id', 'label' => 'OJT Period', 'icon' => 'event',
        'type' => 'select', 'searchable' => true, 'required' => true,
      ],
      AssignmentField::OFFICE_ID => [
        'id' => 'office_id',
        'name' => 'office_id',
        'label' => 'Office',
        'icon' => 'business',
        'type' => 'select',
        'searchable' => true,
        'required' => true,
      ],
      AssignmentField::REQUIRED_HOURS => [
        'id' => 'required_hours',
        'name' => 'required_hours',
        'label' => 'Required Hours',
        'icon' => 'schedule',
        'type' => 'number',
        'required' => true,
      ],
      AssignmentField::STATUS => [
        'id' => 'status',
        'name' => 'status',
        'label' => 'Status',
        'icon' => 'flag',
        'type' => 'select',
        'options' => OjtStatus::options(),
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
   * Return raw value for the BaseField value and formatting pipeline.
   */
  protected function resolveValue(): mixed {
    return $this->value;
  }

  /**
   * Override disabled check to support component prop override.
   */
  public function disabled(): bool {
    return $this->disabled ?? parent::disabled();
  }
}
