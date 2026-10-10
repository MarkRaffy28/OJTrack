<?php

namespace App\View\Components\Fields;

use App\Enums\FieldMode;
use App\Enums\Fields\PasswordField;

class Password extends BaseField {
  public function __construct(
    string|PasswordField $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public ?bool $required = null,
    public ?bool $disabled = null,
  ) {
    $this->fieldEnum = $this->parseEnum($field, PasswordField::class);
    $this->mode = $this->parseMode($mode);
  }

  public function config(): ?array {
    $baseConfig = match ($this->fieldEnum) {
      PasswordField::PASSWORD => [
        'id' => 'password',
        'name' => 'password',
        'label' => 'Password',
        'icon' => 'lock',
        'type' => 'password',
        'required' => true,
      ],
      PasswordField::CURRENT_PASSWORD => [
        'id' => 'current_password',
        'name' => 'current_password',
        'label' => 'Current Password',
        'icon' => 'lock',
        'type' => 'password',
        'required' => true,
      ],
      PasswordField::NEW_PASSWORD => [
        'id' => 'new_password',
        'name' => 'new_password',
        'label' => 'New Password',
        'icon' => 'lock',
        'type' => 'password',
        'required' => true,
      ],
      PasswordField::CONFIRM_PASSWORD => [
        'id' => 'confirm_password',
        'name' => 'confirm_password',
        'label' => 'Confirm Password',
        'icon' => 'lock',
        'type' => 'password',
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
   * Password fields should never expose values to HTML outputs or session old input.
   */
  public function value(): mixed {
    return null;
  }

  protected function resolveValue(): mixed {
    return null;
  }

  public function disabled(): bool {
    return $this->disabled ?? parent::disabled();
  }
}
