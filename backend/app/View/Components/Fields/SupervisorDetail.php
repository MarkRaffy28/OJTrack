<?php

namespace App\View\Components\Fields;

use App\Enums\FieldMode;
use App\Enums\Fields\SupervisorDetailField;
use App\Models\Office;
use App\Models\User;
use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class SupervisorDetail extends Component {
  public SupervisorDetailField $field;
  public FieldMode $mode;

  public function __construct(
    string|SupervisorDetailField $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public ?User $user = null,
    public ?bool $required = null,
  ) {
    $this->field = is_string($field) ? SupervisorDetailField::from($field) : $field;
    $this->mode = is_string($mode) ? FieldMode::from($mode) : $mode;
  }

  /**
   * Get the configuration for the requested field.
   */
  public function config(): ?array {
    return match ($this->field) {
      SupervisorDetailField::OFFICE => [
        'id' => 'office_id',
        'name' => 'office_id',
        'label' => 'Office',
        'icon' => 'business',
        'type' => 'select',
        'options' => Office::query()
          ->orderBy('name')
          ->get()
          ->map(fn(Office $office) => [
            'label' => $office->name,
            'value' => $office->id,
          ])
          ->all(),
        'required' => true,
      ],

      SupervisorDetailField::POSITION => [
        'id' => 'position',
        'name' => 'position',
        'label' => 'Position',
        'icon' => 'badge',
        'max' => 255,
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

  public function value(): mixed {
    $fieldName = rtrim(str_replace(['[', ']'], ['.', ''], $this->config()['name'] ?? $this->field->value), '.');
    $value = $this->user?->supervisorDetail?->{$this->field->value};

    return old($fieldName, $value);
  }

  public function render(): View|Closure|string {
    return view('components.fields.supervisor-detail');
  }
}
