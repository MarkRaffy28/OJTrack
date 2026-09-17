<?php

namespace App\View\Components\Fields;

use App\Enums\FieldMode;
use App\Enums\Fields\PasswordField;
use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class Password extends Component {
  public PasswordField $field;
  public FieldMode $mode;

  public function __construct(
    string|PasswordField $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public ?bool $required = null,
  ) {
    $this->field = is_string($field) ? PasswordField::from($field) : $field;
    $this->mode = is_string($mode) ? FieldMode::from($mode) : $mode;
  }

  /**
   * Get the configuration for the requested field.
   */
  public function config(): ?array {
    return match ($this->field) {
      PasswordField::PASSWORD => [
        'id' => 'password',
        'name' => 'password',
        'label' => 'Password',
        'icon' => 'lock',
        'secure' => true,
        'required' => true,
      ],

      PasswordField::CURRENT_PASSWORD => [
        'id' => 'current_password',
        'name' => 'current_password',
        'label' => 'Current Password',
        'icon' => 'lock',
        'secure' => true,
        'required' => true,
      ],

      PasswordField::NEW_PASSWORD => [
        'id' => 'new_password',
        'name' => 'new_password',
        'label' => 'New Password',
        'icon' => 'lock',
        'secure' => true,
        'required' => true,
      ],

      PasswordField::CONFIRM_PASSWORD => [
        'id' => 'confirm_password',
        'name' => 'confirm_password',
        'label' => 'Confirm Password',
        'icon' => 'lock',
        'secure' => true,
        'required' => true,
      ],
    };
  }

  /**
   * Whether the field should be readonly.
   */
  public function readonly(): bool {
    return $this->mode === FieldMode::VIEW
      || ($this->config()['readonly'] ?? false);
  }

  public function render(): View|Closure|string {
    return view('components.fields.password');
  }
}