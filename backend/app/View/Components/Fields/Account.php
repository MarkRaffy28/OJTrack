<?php

namespace App\View\Components\Fields;

use App\Enums\AccountStatus;
use App\Enums\FieldMode;
use App\Enums\Fields\AccountField;
use App\Enums\UserRole;
use App\Models\User;

class Account extends BaseField {
  public function __construct(
    string|AccountField $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public ?User $user = null,
    public ?bool $required = null,
    public ?bool $disabled = null,
    public ?array $optionOnly = null,
  ) {
    $this->fieldEnum = $this->parseEnum($field, AccountField::class);
    $this->mode = $this->parseMode($mode);
  }

  /**
   * Get field configuration, allowing instance properties to override defaults.
   */
  public function config(): ?array {
    $baseConfig = match ($this->fieldEnum) {
      AccountField::ROLE => [
        'id' => 'role',
        'name' => 'role',
        'label' => 'Role',
        'icon' => 'badge',
        'type' => 'select',
        'options' => UserRole::options($this->optionOnly),
        'required' => true,
      ],
      AccountField::STATUS => [
        'id' => 'status',
        'name' => 'status',
        'label' => 'Status',
        'icon' => 'shield_toggle',
        'type' => 'select',
        'options' => AccountStatus::options($this->optionOnly),
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
   * Resolve raw model values for the BaseField formatting pipeline.
   */
  protected function resolveValue(): mixed {
    if (!$this->user) {
      return null;
    }

    return match ($this->fieldEnum) {
      AccountField::ROLE => $this->user->role,
      AccountField::STATUS => $this->user->status,
    };
  }
}
