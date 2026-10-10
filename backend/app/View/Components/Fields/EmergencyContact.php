<?php

namespace App\View\Components\Fields;

use App\Enums\FieldMode;
use App\Enums\Fields\EmergencyContactField;
use App\Models\User;

class EmergencyContact extends BaseField {
  public function __construct(
    string|EmergencyContactField $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public ?User $user = null,
    public ?bool $required = null,
    public ?bool $disabled = null,
  ) {
    $this->fieldEnum = $this->parseEnum($field, EmergencyContactField::class);
    $this->mode = $this->parseMode($mode);
  }

  public function config(): ?array {
    $baseConfig = match ($this->fieldEnum) {
      EmergencyContactField::NAME => [
        'id' => 'emergency_contact_name',
        'name' => 'emergency_contact[name]',
        'label' => 'Full Name',
        'placeholder' => "Enter emergency contact's full name",
        'icon' => 'person',
        'type' => 'text',
        'max' => 210,
      ],
      EmergencyContactField::RELATIONSHIP => [
        'id' => 'emergency_contact_relationship',
        'name' => 'emergency_contact[relationship]',
        'label' => 'Relationship',
        'placeholder' => 'e.g. Mother, Father, Guardian',
        'icon' => 'group',
        'type' => 'text',
        'max' => 50,
      ],
      EmergencyContactField::CONTACT_NUMBER => [
        'id' => 'emergency_contact_number',
        'name' => 'emergency_contact[contact_number]',
        'label' => 'Contact Number',
        'placeholder' => "Enter emergency contact's number",
        'icon' => 'phone',
        'type' => 'tel',
        'max' => 11,
      ],
      EmergencyContactField::ADDRESS => [
        'id' => 'emergency_contact_address',
        'name' => 'emergency_contact[address]',
        'label' => 'Contact Address',
        'placeholder' => "Enter emergency contact's address",
        'icon' => 'location_on',
        'type' => 'text',
        'max' => 255,
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
   * Resolve the value from the user's primary emergency contact.
   */
  protected function resolveValue(): mixed {
    if (!$this->user) {
      return null;
    }

    $contact = $this->user->emergencyContacts?->firstWhere('is_primary', true);

    if (!$contact) {
      return null;
    }

    return match ($this->fieldEnum) {
      EmergencyContactField::NAME => $contact->name,
      EmergencyContactField::RELATIONSHIP => $contact->relationship,
      EmergencyContactField::CONTACT_NUMBER => $contact->contact_number,
      EmergencyContactField::ADDRESS => $contact->address,
    };
  }

  public function disabled(): bool {
    return $this->disabled ?? parent::disabled();
  }
}
