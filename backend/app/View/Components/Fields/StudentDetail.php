<?php

namespace App\View\Components\Fields;

use App\Enums\FieldMode;
use App\Enums\Fields\StudentDetailField;
use App\Models\User;
use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class StudentDetail extends Component {
  public StudentDetailField $field;
  public FieldMode $mode;

  public function __construct(
    string|StudentDetailField $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public ?User $user = null,
    public ?bool $required = null,
  ) {
    $this->field = is_string($field) ? StudentDetailField::from($field) : $field;
    $this->mode = is_string($mode) ? FieldMode::from($mode) : $mode;
  }

  /**
   * Get the configuration for the requested field.
   */
  public function config(): ?array {
    return match ($this->field) {
      StudentDetailField::YEAR => [
        'id' => 'year',
        'name' => 'year',
        'label' => 'Year',
        'icon' => '123',
        'type' => 'select',
        'options' => [
          ['label' => '4', 'value' => 4],
        ],
      ],

      StudentDetailField::PROGRAM => [
        'id' => 'program',
        'name' => 'program',
        'label' => 'Program',
        'icon' => 'school',
        'type' => 'select',
        'options' => [
          ['label' => 'BS Information Technology', 'value' => 'BSIT'],
          ['label' => 'BS Information System', 'value' => 'BSIS'],
        ],
      ],

      StudentDetailField::MAJOR => [
        'id' => 'major',
        'name' => 'major',
        'label' => 'Major',
        'icon' => 'code',
        'type' => 'select',
        'options' => [
          ['label' => 'Web and Mobile Development', 'value' => 'WMD'],
          ['label' => 'Cybersecurity and Networking', 'value' => 'CSN'],
        ],
      ],

      StudentDetailField::SECTION => [
        'id' => 'section',
        'name' => 'section',
        'label' => 'Section',
        'icon' => 'abc',
        'max' => 10,
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
    $value = $this->user?->studentDetail?->{$this->field->value};

    return old($fieldName, $value);
  }

  public function render(): View|Closure|string {
    return view('components.fields.student-detail');
  }
}