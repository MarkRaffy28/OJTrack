<?php

namespace App\View\Components\Fields;

use App\Enums\EvaluationStatus;
use App\Enums\FieldMode;
use App\Enums\Fields\EvaluationField;

class Evaluation extends BaseField {
  public function __construct(
    string|EvaluationField $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public mixed $value = null,
    public array $options = [],
    public ?bool $required = null,
    public ?bool $disabled = null,
  ) {
    $this->fieldEnum = $this->parseEnum($field, EvaluationField::class);
    $this->mode = $this->parseMode($mode);
  }

  public function config(): ?array {
    $baseConfig = match ($this->fieldEnum) {
      EvaluationField::STUDENT_OJT_ID => [
        'id' => EvaluationField::STUDENT_OJT_ID->value,
        'name' => EvaluationField::STUDENT_OJT_ID->value,
        'label' => 'Student',
        'icon' => 'person',
        'type' => 'select',
        'searchable' => true,
        'required' => true,
      ],
      EvaluationField::EVALUATION_TYPE => [
        'id' => EvaluationField::EVALUATION_TYPE->value,
        'name' => EvaluationField::EVALUATION_TYPE->value,
        'label' => 'Evaluation Type',
        'icon' => 'fact_check',
        'type' => 'select',
        'options' => [
          ['value' => 'supervisor', 'label' => 'Supervisor'],
          ['value' => 'instructor', 'label' => 'Instructor'],
        ],
        'required' => true,
      ],
      EvaluationField::PERIOD => [
        'id' => EvaluationField::PERIOD->value,
        'name' => EvaluationField::PERIOD->value,
        'label' => 'Period',
        'icon' => 'event',
        'type' => 'select',
        'options' => [
          ['value' => '', 'label' => 'Not applicable'],
          ['value' => 'midterm', 'label' => 'Midterm'],
          ['value' => 'final', 'label' => 'Final'],
        ],
        'required' => false,
      ],
      EvaluationField::STATUS => [
        'id' => EvaluationField::STATUS->value,
        'name' => EvaluationField::STATUS->value,
        'label' => 'Status',
        'icon' => 'flag',
        'type' => 'select',
        'options' => EvaluationStatus::options(),
        'required' => true,
      ],
      EvaluationField::REMARKS => [
        'id' => EvaluationField::REMARKS->value,
        'name' => EvaluationField::REMARKS->value,
        'label' => 'Remarks',
        'icon' => 'notes',
        'type' => 'textarea',
        'rows' => 4,
        'required' => false,
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

  protected function resolveValue(): mixed {
    return $this->value;
  }

  public function disabled(): bool {
    return $this->disabled ?? parent::disabled();
  }
}
