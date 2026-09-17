<?php

namespace App\View\Components\Fields;

use App\Enums\Fields\ContactField;
use App\Enums\FieldMode;
use App\Models\User;
use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class Contact extends Component {
  public ContactField $field;
  public FieldMode $mode;

  public function __construct(
    string|ContactField $field,
    FieldMode|string $mode = FieldMode::EDIT,
    public ?User $user = null,
    public ?bool $required = null,
  ) {
    $this->field = is_string($field) ? ContactField::from($field) : $field;
    $this->mode = is_string($mode) ? FieldMode::from($mode) : $mode;
  }

  /**
   * Get the configuration for the requested field.
   */
  public function config(): ?array {
    return match ($this->field) {
      ContactField::HOME_ADDRESS => [
        'id' => 'home_address',
        'name' => 'home_address',
        'label' => 'Home Address',
        'icon' => 'home',
        'max' => 255,
      ],

      ContactField::PRESENT_ADDRESS => [
        'id' => 'present_address',
        'name' => 'present_address',
        'label' => 'Present Address',
        'icon' => 'location_on',
        'max' => 255,
      ],

      ContactField::CONTACT_NUMBER => [
        'id' => 'contact_number',
        'name' => 'contact_number',
        'label' => 'Contact Number',
        'icon' => 'phone',
        'max' => 11,
      ],

      ContactField::EMAIL => [
        'id' => 'email',
        'name' => 'email',
        'label' => 'Email',
        'icon' => 'email',
        'max' => 100,
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
    return view('components.fields.contact');
  }
}