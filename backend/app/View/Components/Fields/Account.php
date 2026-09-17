<?php

namespace App\View\Components\Fields;

use App\Enums\AccountStatus;
use App\Enums\FieldMode;
use App\Enums\Fields\AccountField;
use App\Enums\UserRoles;
use App\Models\User;
use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class Account extends Component {
  public AccountField $field;
  public FieldMode $mode;

  public function __construct(
    string|AccountField $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public ?User $user = null,
    public ?bool $required = null,
    public ?bool $disabled = null,
  ) {
    $this->field = is_string($field) ? AccountField::from($field) : $field;
    $this->mode = is_string($mode) ? FieldMode::from($mode) : $mode;
  }

  public function config(): ?array {
    return match ($this->field) {
      AccountField::ROLE => [
        'id' => 'role',
        'name' => 'role',
        'label' => 'Role',
        'icon' => 'badge',
        'type' => 'select',
        'options' => UserRoles::options(),
        'required' => true,
      ],

      AccountField::STATUS => [
        'id' => 'status',
        'name' => 'status',
        'label' => 'Status',
        'icon' => 'shield_toggle',
        'type' => 'select',
        'options' => AccountStatus::options(),
        'required' => true,
      ],
    };
  }

  public function disabled(): bool {
    return $this->disabled
      ?? ($this->mode === FieldMode::VIEW || ($this->config()['disabled'] ?? false));
  }

  public function readonly(): bool {
    return $this->mode === FieldMode::VIEW
      || ($this->config()['readonly'] ?? false);
  }

  public function value(): mixed {
    if (!$this->user)
      return null;

    $fieldName = rtrim(str_replace(['[', ']'], ['.', ''], $this->config()['name'] ?? ($this->field === AccountField::ROLE ?
      'role' : 'status')), '.');
    $fieldKey = $this->field === AccountField::ROLE ? 'role' : 'status';
    $raw = $this->user?->{$fieldKey};
    $value = $raw instanceof \BackedEnum ? $raw->value : $raw;

    return old($fieldName, $value);
  }

  public function render(): View|Closure|string {
    return view('components.fields.account');
  }
}