<?php

namespace App\View\Components\Fields;

use App\Enums\AcademicMajor;
use App\Enums\AcademicProgram;
use App\Enums\FieldMode;
use App\Enums\Fields\StudentDetailField;
use App\Models\User;

class StudentDetail extends BaseField {
  public function __construct(
    string|StudentDetailField $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public ?User $user = null,
    public ?bool $required = null,
    public ?bool $disabled = null,
  ) {
    $this->fieldEnum = $this->parseEnum($field, StudentDetailField::class);
    $this->mode = $this->parseMode($mode);
  }

  public function config(): ?array {
    $baseConfig = match ($this->fieldEnum) {
      StudentDetailField::YEAR => [
        'id' => 'year',
        'name' => 'year',
        'label' => 'Year',
        'icon' => '123',
        'type' => 'select',
        'options' => [
          ['label' => '4', 'value' => 4, 'selected'],
        ],
      ],
      StudentDetailField::PROGRAM => [
        'id' => 'program',
        'name' => 'program',
        'label' => 'Program',
        'icon' => 'school',
        'type' => 'select',
        'options' => AcademicProgram::options(),
      ],
      StudentDetailField::MAJOR => [
        'id' => 'major',
        'name' => 'major',
        'label' => 'Major',
        'icon' => 'code',
        'type' => 'select',
        'options' => AcademicMajor::options(),
      ],
      StudentDetailField::SECTION => [
        'id' => 'section',
        'name' => 'section',
        'label' => 'Section',
        'icon' => 'abc',
        'type' => 'text',
        'max' => 10,
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
   * Safely resolve value from studentDetail relationship.
   */
  protected function resolveValue(): mixed {
    if (!$this->user?->studentDetail) {
      return null;
    }

    return match ($this->fieldEnum) {
      StudentDetailField::YEAR => $this->user->studentDetail->year,
      StudentDetailField::PROGRAM => $this->user->studentDetail->program,
      StudentDetailField::MAJOR => $this->user->studentDetail->major,
      StudentDetailField::SECTION => $this->user->studentDetail->section,
    };
  }

  public function disabled(): bool {
    return $this->disabled ?? parent::disabled();
  }
}
