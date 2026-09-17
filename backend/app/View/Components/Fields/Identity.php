<?php

namespace App\View\Components\Fields;

use App\Enums\FieldMode;
use App\Enums\Fields\IdentityField;
use App\Models\User;
use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class Identity extends Component {
  public IdentityField $field;
  public FieldMode $mode;

  public function __construct(
    string|IdentityField $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public ?User $user = null,
    public ?bool $required = null,
  ) {
    $this->field = is_string($field) ? IdentityField::from($field) : $field;
    $this->mode = is_string($mode) ? FieldMode::from($mode) : $mode;
  }

  /**
   * Get the configuration for the requested field.
   */
  public function config(): array {
    return match ($this->field) {
      IdentityField::USER_ID => [
        'id' => 'user_id',
        'name' => 'user_id',
        'label' => 'User ID',
        'icon' => 'key',
        'max' => 100,
        'required' => true,
      ],

      IdentityField::USERNAME => [
        'id' => 'username',
        'name' => 'username',
        'label' => 'Username',
        'icon' => 'person',
        'max' => 100,
        'required' => true,
      ],

      IdentityField::FIRST_NAME => [
        'id' => 'first_name',
        'name' => 'first_name',
        'label' => 'First Name',
        'icon' => 'person',
        'max' => 100,
        'required' => true,
      ],

      IdentityField::MIDDLE_NAME => [
        'id' => 'middle_name',
        'name' => 'middle_name',
        'label' => 'Middle Name',
        'icon' => 'person',
        'max' => 50,
      ],

      IdentityField::LAST_NAME => [
        'id' => 'last_name',
        'name' => 'last_name',
        'label' => 'Last Name',
        'icon' => 'person',
        'max' => 50,
        'required' => true,
      ],

      IdentityField::EXTENSION_NAME => [
        'id' => 'extension_name',
        'name' => 'extension_name',
        'label' => 'Extension Name',
        'icon' => 'person',
        'max' => 10,
      ],

      IdentityField::FULL_NAME => [
        'id' => 'full_name',
        'name' => 'full_name',
        'label' => 'Full Name',
        'icon' => 'person',
        'max' => 100,
        'readonly' => true,
      ],
    };
  }

  /**
   * Get the current value for the requested field.
   */
  public function value(): mixed {
    $fieldName = rtrim(str_replace(['[', ']'], ['.', ''], $this->config()['name'] ?? $this->field->value), '.');
    $value = $this->user?->{$this->field->value};

    return old($fieldName, $value);
  }

  /**
   * Whether the field should be readonly.
   */
  public function readonly(): bool {
    return $this->mode === FieldMode::VIEW
      || ($this->config()['readonly'] ?? false);
  }

  public function render(): View|Closure|string {
    return view('components.fields.identity');
  }
}