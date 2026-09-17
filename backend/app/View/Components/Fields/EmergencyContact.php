<?php

namespace App\View\Components\Fields;

use App\Enums\Fields\EmergencyContactField;
use App\Enums\FieldMode;
use App\Models\User;
use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class EmergencyContact extends Component {
  public EmergencyContactField $field;
  public FieldMode $mode;

  public function __construct(
    string|EmergencyContactField $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public ?User $user = null,
    public ?bool $required = null,
  ) {
    $this->field = is_string($field) ? EmergencyContactField::from($field) : $field;
    $this->mode = is_string($mode) ? FieldMode::from($mode) : $mode;
  }

  /**
   * Get the configuration for the requested field.
   */
  public function config(): ?array {
    return match ($this->field) {
      EmergencyContactField::NAME => [
        'id' => 'emergency_contact_name',
        'name' => 'emergency_contact[name]',
        'label' => 'Full Name',
        'placeholder' => "Enter emergency contact's full name",
        'icon' => 'person',
        'max' => 210,
      ],

      EmergencyContactField::RELATIONSHIP => [
        'id' => 'emergency_contact_relationship',
        'name' => 'emergency_contact[relationship]',
        'label' => 'Relationship',
        'placeholder' => 'e.g. Mother, Father, Guardian',
        'icon' => 'group',
        'max' => 50,
      ],

      EmergencyContactField::CONTACT_NUMBER => [
        'id' => 'emergency_contact_number',
        'name' => 'emergency_contact[contact_number]',
        'label' => 'Contact Number',
        'placeholder' => "Enter emergency contact's number",
        'icon' => 'phone',
        'max' => 11,
      ],

      EmergencyContactField::ADDRESS => [
        'id' => 'emergency_contact_address',
        'name' => 'emergency_contact[address]',
        'label' => 'Contact Address',
        'placeholder' => "Enter emergency contact's address",
        'icon' => 'location_on',
        'max' => 255,
      ],
    };
  }

  /**
   * Get the current value for the requested field.
   */
  public function value(): mixed {
    $fieldName = rtrim(str_replace(['[', ']'], ['.', ''], $this->config()['name'] ?? $this->field->value), '.');
    $contact = $this->user?->emergencyContacts?->firstWhere('is_primary', true);
    $value = $contact?->{$this->field->value};

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
    return view('components.fields.emergency-contact');
  }
}