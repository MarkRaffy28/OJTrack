<?php

namespace App\View\Components\Fields;

use App\Enums\FieldMode;
use App\Enums\Fields\ContactField;
use App\Models\User;

class Contact extends BaseField {
  public function __construct(
    string|ContactField $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public ?User $user = null,
    public ?bool $required = null,
    public ?bool $disabled = null,
  ) {
    $this->fieldEnum = $this->parseEnum($field, ContactField::class);
    $this->mode = $this->parseMode($mode);
  }

  public function config(): ?array {
    $baseConfig = match ($this->fieldEnum) {
      ContactField::HOME_ADDRESS => [
        'id' => 'home_address',
        'name' => 'home_address',
        'label' => 'Home Address',
        'icon' => 'home',
        'type' => 'text',
        'max' => 255,
      ],
      ContactField::PRESENT_ADDRESS => [
        'id' => 'present_address',
        'name' => 'present_address',
        'label' => 'Present Address',
        'icon' => 'location_on',
        'type' => 'text',
        'max' => 255,
      ],
      ContactField::CONTACT_NUMBER => [
        'id' => 'contact_number',
        'name' => 'contact_number',
        'label' => 'Contact Number',
        'icon' => 'phone',
        'type' => 'tel',
        'max' => 11,
      ],
      ContactField::EMAIL => [
        'id' => 'email',
        'name' => 'email',
        'label' => 'Email',
        'icon' => 'email',
        'type' => 'email',
        'max' => 100,
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
   * Resolve model value safely using explicit enum mapping.
   */
  protected function resolveValue(): mixed {
    if (!$this->user) {
      return null;
    }

    return match ($this->fieldEnum) {
      ContactField::HOME_ADDRESS => $this->user->home_address,
      ContactField::PRESENT_ADDRESS => $this->user->present_address,
      ContactField::CONTACT_NUMBER => $this->user->contact_number,
      ContactField::EMAIL => $this->user->email,
    };
  }

  public function disabled(): bool {
    return $this->disabled ?? parent::disabled();
  }
}
