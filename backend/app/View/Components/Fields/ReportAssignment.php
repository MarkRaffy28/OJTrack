<?php

namespace App\View\Components\Fields;

use App\Enums\FieldMode;
use App\Enums\Fields\ReportAssignmentField;
use App\Enums\ReportType;

class ReportAssignment extends BaseField {
  public function __construct(
    string|ReportAssignmentField $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public mixed $value = null,
    public array $options = [],
    public ?bool $required = null,
    public ?bool $disabled = null,
  ) {
    $this->fieldEnum = $this->parseEnum($field, ReportAssignmentField::class);
    $this->mode = $this->parseMode($mode);
  }

  public function config(): array {
    $config = match ($this->fieldEnum) {
      ReportAssignmentField::TITLE => [
        'id' => 'title', 'name' => 'title', 'label' => 'Title',
        'icon' => 'title', 'type' => 'text', 'required' => true,
      ],
      ReportAssignmentField::OJT_ID => [
        'id' => 'ojt_id', 'name' => 'ojt_id', 'label' => 'OJT Cohort',
        'icon' => 'event', 'type' => 'select', 'searchable' => true, 'required' => true,
      ],
      ReportAssignmentField::TYPE => [
        'id' => 'type', 'name' => 'type', 'label' => 'Report Type',
        'icon' => 'description', 'type' => 'select', 'options' => ReportType::options(), 'required' => true,
      ],
      ReportAssignmentField::DUE_AT => [
        'id' => 'due_at', 'name' => 'due_at', 'label' => 'Due At',
        'icon' => 'schedule', 'type' => 'datetime-local', 'required' => true,
      ],
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
