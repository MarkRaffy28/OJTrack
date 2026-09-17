<?php

namespace App\View\Components\Fields;

use App\Enums\FieldMode;
use App\Enums\Fields\PersonalField;
use App\Models\User;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class Personal extends Component {
  public PersonalField $field;
  public FieldMode $mode;

  public function __construct(
    string|PersonalField $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public ?User $user = null,
    public ?bool $required = null,
  ) {
    $this->field = is_string($field) ? PersonalField::from($field) : $field;
    $this->mode = is_string($mode) ? FieldMode::from($mode) : $mode;
  }

  /**
   * Get the configuration for the requested field.
   */
  public function config(): array {
    return match ($this->field) {
      PersonalField::BIRTH_DATE => [
        'id' => 'birth_date',
        'name' => 'birth_date',
        'label' => 'Birth Date',
        'icon' => 'calendar_today',
        'type' => 'date',
        'required' => true,
      ],

      PersonalField::GENDER => [
        'id' => 'gender',
        'name' => 'gender',
        'label' => 'Gender',
        'icon' => 'transgender',
        'type' => 'select',
        'required' => true,
        'options' => [
          ['label' => 'Male', 'value' => 'Male'],
          ['label' => 'Female', 'value' => 'Female'],
          ['label' => 'Other', 'value' => 'Other'],
        ],
      ],
    };
  }

  /**
   * Get the current value for the requested field.
   */
  public function value(): mixed {
    $fieldName = rtrim(str_replace(['[', ']'], ['.', ''], $this->config()['name'] ?? $this->field->value), '.');
    $raw = $this->user?->{$this->field->value};

    if ($raw instanceof Carbon || $raw instanceof CarbonInterface) {
      $raw = $raw->format('Y-m-d');
    }

    return old($fieldName, $raw);
  }

  /**
   * Whether the field should be readonly.
   */
  public function readonly(): bool {
    return $this->mode === FieldMode::VIEW
      || ($this->config()['readonly'] ?? false);
  }

  public function render(): View|Closure|string {
    return view('components.fields.personal');
  }
}