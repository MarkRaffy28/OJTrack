<?php

namespace App\View\Components\Fields;

use App\Enums\FieldMode;
use App\Enums\Fields\SupervisorDetailField;
use App\Models\Office;
use App\Models\User;

class SupervisorDetail extends BaseField {
  public function __construct(
    string|SupervisorDetailField $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public ?User $user = null,
    public ?bool $required = null,
    public ?bool $disabled = null,
    public array $options = [],
  ) {
    $this->fieldEnum = $this->parseEnum($field, SupervisorDetailField::class);
    $this->mode = $this->parseMode($mode);
  }

  public function config(): ?array {
    $baseConfig = match ($this->fieldEnum) {
      SupervisorDetailField::OFFICE => [
        'id' => 'office_id',
        'name' => 'office_id',
        'label' => 'Office',
        'icon' => 'business',
        'type' => 'select',
        'options' => !empty($this->options) ? $this->options : $this->getOfficeOptions(),
        'required' => true,
      ],
      SupervisorDetailField::POSITION => [
        'id' => 'position',
        'name' => 'position',
        'label' => 'Position',
        'icon' => 'badge',
        'type' => 'text',
        'max' => 255,
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
   * Safely resolve attribute values from the user's supervisorDetail relationship.
   */
  protected function resolveValue(): mixed {
    if (!$this->user?->supervisorDetail) {
      return null;
    }

    return match ($this->fieldEnum) {
      SupervisorDetailField::OFFICE => $this->user->supervisorDetail->office_id,
      SupervisorDetailField::POSITION => $this->user->supervisorDetail->position,
    };
  }

  /**
   * Fetch default office options for the select field.
   */
  protected function getOfficeOptions(): array {
    return Office::query()
      ->orderBy('name')
      ->pluck('name', 'id')
      ->all();
  }

  public function disabled(): bool {
    return $this->disabled ?? parent::disabled();
  }
}
