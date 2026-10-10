<?php

namespace App\View\Components\Fields;

use App\Enums\FieldMode;
use App\Enums\Fields\StudentOjtField;
use App\Enums\OjtStatus;
use App\Enums\OjtTerm;
use App\Models\StudentOjt as StudentOjtModel;

class StudentOjt extends BaseField {
  public function __construct(
    string|StudentOjtField $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public ?StudentOjtModel $studentOjt = null,
    public ?bool $required = null,
    public ?bool $disabled = null,
  ) {
    $this->fieldEnum = $this->parseEnum($field, StudentOjtField::class);
    $this->mode = $this->parseMode($mode);
  }

  public function config(): ?array {
    $baseConfig = match ($this->fieldEnum) {
      StudentOjtField::ACADEMIC_YEAR => [
        'id' => 'academic_year',
        'name' => 'academic_year',
        'label' => 'Academic Year',
        'icon' => 'school',
        'type' => 'text',
        'required' => true,
      ],
      StudentOjtField::TERM => [
        'id' => 'term',
        'name' => 'term',
        'label' => 'Term',
        'icon' => 'event',
        'type' => 'select',
        'options' => OjtTerm::options(),
        'required' => true,
      ],
      StudentOjtField::REQUIRED_HOURS => [
        'id' => 'required_hours',
        'name' => 'required_hours',
        'label' => 'Required Hours',
        'icon' => 'schedule',
        'type' => 'number',
        'required' => true,
      ],
      StudentOjtField::STATUS => [
        'id' => 'status',
        'name' => 'status',
        'label' => 'Status',
        'icon' => 'flag',
        'type' => 'select',
        'options' => OjtStatus::options(),
        'required' => true,
      ],
      StudentOjtField::START_DATE => [
        'id' => 'start_date',
        'name' => 'start_date',
        'label' => 'Start Date',
        'icon' => 'calendar_today',
        'type' => 'date',
        'required' => true,
      ],
      StudentOjtField::END_DATE => [
        'id' => 'end_date',
        'name' => 'end_date',
        'label' => 'End Date',
        'icon' => 'event',
        'type' => 'date',
        'required' => true,
      ],
    };

    if ($this->required !== null) {
      $baseConfig['required'] = $this->required;
    }

    if ($this->disabled !== null) {
      $baseConfig['disabled'] = $this->disabled;
    }

    return $baseConfig;
  }

  /**
   * Resolve explicit attribute values from the StudentOjt model.
   */
  protected function resolveValue(): mixed {
    if (!$this->studentOjt) {
      return null;
    }

    return match ($this->fieldEnum) {
      StudentOjtField::ACADEMIC_YEAR => $this->studentOjt->academic_year,
      StudentOjtField::TERM => $this->studentOjt->term,
      StudentOjtField::REQUIRED_HOURS => $this->studentOjt->required_hours,
      StudentOjtField::STATUS => $this->studentOjt->status,
      StudentOjtField::START_DATE => $this->studentOjt->start_date,
      StudentOjtField::END_DATE => $this->studentOjt->end_date,
    };
  }

  public function disabled(): bool {
    return $this->disabled ?? parent::disabled();
  }
}
