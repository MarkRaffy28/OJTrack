<?php

namespace App\View\Components\Fields;

use App\Enums\FieldMode;
use App\Enums\Fields\InstructorDetailField;
use App\Models\User;
use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class InstructorDetail extends Component {
  public InstructorDetailField $field;
  public FieldMode $mode;

  public function __construct(
    string|InstructorDetailField $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public ?User $user = null,
    public ?bool $required = null,
  ) {
    $this->field = is_string($field) ? InstructorDetailField::from($field) : $field;
    $this->mode = is_string($mode) ? FieldMode::from($mode) : $mode;
  }

  /**
   * Get the configuration for the requested field.
   */
  public function config(): ?array {
    return match ($this->field) {
      InstructorDetailField::DEPARTMENT => [
        'id' => 'department',
        'name' => 'department',
        'label' => 'Department',
        'icon' => 'business',
        'max' => 100,
        'required' => true,
      ],

      InstructorDetailField::SECTION => [
        'id' => 'section',
        'name' => 'section',
        'label' => 'Section',
        'icon' => 'abc',
        'max' => 10,
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
    $value = $this->user?->instructorDetail?->{$this->field->value};

    return old($fieldName, $value);
  }

  public function render(): View|Closure|string {
    return view('components.fields.instructor-detail');
  }
}