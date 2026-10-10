<?php

namespace App\View\Components\Fields;

use App\Enums\FieldMode;
use App\Enums\Fields\PersonalField;
use App\Models\User;

class Personal extends BaseField {
  public function __construct(
    string|PersonalField $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public ?User $user = null,
    public ?bool $required = null,
    public ?bool $disabled = null,
  ) {
    $this->fieldEnum = $this->parseEnum($field, PersonalField::class);
    $this->mode = $this->parseMode($mode);
  }

  public function config(): array {
    $baseConfig = match ($this->fieldEnum) {
      PersonalField::BIRTH_DATE => [
        'id' => 'birth_date',
        'name' => 'birth_date',
        'label' => 'Birth Date',
        'icon' => 'calendar_today',
        'type' => 'date',
        'required' => true,
      ],
      PersonalField::GENDER => [
        'id' => 'gender',
        'name' => 'gender',
        'label' => 'Gender',
        'icon' => 'transgender',
        'type' => 'select',
        'required' => true,
        'options' => [
          ['label' => 'Male', 'value' => 'Male'],
          ['label' => 'Female', 'value' => 'Female'],
          ['label' => 'Other', 'value' => 'Other'],
        ],
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
   * Resolve explicit attribute values from the user model.
   */
  protected function resolveValue(): mixed {
    if (!$this->user) {
      return null;
    }

    return match ($this->fieldEnum) {
      PersonalField::BIRTH_DATE => $this->user->birth_date,
      PersonalField::GENDER => $this->user->gender,
    };
  }

  public function disabled(): bool {
    return $this->disabled ?? parent::disabled();
  }
}
