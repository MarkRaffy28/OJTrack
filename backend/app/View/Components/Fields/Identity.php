<?php

namespace App\View\Components\Fields;

use App\Enums\FieldMode;
use App\Enums\Fields\IdentityField;
use App\Models\User;

class Identity extends BaseField {
  public function __construct(
    string|IdentityField $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public ?User $user = null,
    public ?bool $required = null,
    public ?bool $disabled = null,
  ) {
    $this->fieldEnum = $this->parseEnum($field, IdentityField::class);
    $this->mode = $this->parseMode($mode);
  }

  public function config(): array {
    $baseConfig = match ($this->fieldEnum) {
      IdentityField::USER_ID => [
        'id' => 'user_id',
        'name' => 'user_id',
        'label' => 'User ID',
        'icon' => 'key',
        'type' => 'text',
        'max' => 100,
        'required' => true,
      ],
      IdentityField::USERNAME => [
        'id' => 'username',
        'name' => 'username',
        'label' => 'Username',
        'icon' => 'person',
        'type' => 'text',
        'max' => 100,
        'required' => true,
      ],
      IdentityField::FIRST_NAME => [
        'id' => 'first_name',
        'name' => 'first_name',
        'label' => 'First Name',
        'icon' => 'person',
        'type' => 'text',
        'max' => 100,
        'required' => true,
      ],
      IdentityField::MIDDLE_NAME => [
        'id' => 'middle_name',
        'name' => 'middle_name',
        'label' => 'Middle Name',
        'icon' => 'person',
        'type' => 'text',
        'max' => 50,
      ],
      IdentityField::LAST_NAME => [
        'id' => 'last_name',
        'name' => 'last_name',
        'label' => 'Last Name',
        'icon' => 'person',
        'type' => 'text',
        'max' => 50,
        'required' => true,
      ],
      IdentityField::EXTENSION_NAME => [
        'id' => 'extension_name',
        'name' => 'extension_name',
        'label' => 'Extension Name',
        'icon' => 'person',
        'type' => 'text',
        'max' => 10,
      ],
      IdentityField::FULL_NAME => [
        'id' => 'full_name',
        'name' => 'full_name',
        'label' => 'Full Name',
        'icon' => 'person',
        'type' => 'text',
        'max' => 100,
        'readonly' => true,
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
      IdentityField::USER_ID => $this->user->user_id,
      IdentityField::USERNAME => $this->user->username,
      IdentityField::FIRST_NAME => $this->user->first_name,
      IdentityField::MIDDLE_NAME => $this->user->middle_name,
      IdentityField::LAST_NAME => $this->user->last_name,
      IdentityField::EXTENSION_NAME => $this->user->extension_name,
      IdentityField::FULL_NAME => $this->user->full_name,
    };
  }

  public function disabled(): bool {
    return $this->disabled ?? parent::disabled();
  }
}
