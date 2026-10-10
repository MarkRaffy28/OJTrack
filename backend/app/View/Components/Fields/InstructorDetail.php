<?php

namespace App\View\Components\Fields;

use App\Enums\FieldMode;
use App\Enums\Fields\InstructorDetailField;
use App\Models\User;

class InstructorDetail extends BaseField {
  public function __construct(
    string|InstructorDetailField $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public ?User $user = null,
    public ?bool $required = null,
    public ?bool $disabled = null,
  ) {
    $this->fieldEnum = $this->parseEnum($field, InstructorDetailField::class);
    $this->mode = $this->parseMode($mode);
  }

  public function config(): ?array {
    $baseConfig = match ($this->fieldEnum) {
      InstructorDetailField::DEPARTMENT => [
        'id' => 'department',
        'name' => 'department',
        'label' => 'Department',
        'icon' => 'business',
        'type' => 'text',
        'max' => 100,
        'required' => true,
      ],
      InstructorDetailField::SECTION => [
        'id' => 'section',
        'name' => 'section',
        'label' => 'Section',
        'icon' => 'abc',
        'type' => 'text',
        'max' => 10,
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
   * Safely resolve values from the user's instructorDetail relationship.
   */
  protected function resolveValue(): mixed {
    if (!$this->user?->instructorDetail) {
      return null;
    }

    return match ($this->fieldEnum) {
      InstructorDetailField::DEPARTMENT => $this->user->instructorDetail->department,
      InstructorDetailField::SECTION => $this->user->instructorDetail->section,
    };
  }

  public function disabled(): bool {
    return $this->disabled ?? parent::disabled();
  }
}
