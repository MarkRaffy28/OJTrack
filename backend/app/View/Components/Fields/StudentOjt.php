<?php

namespace App\View\Components\Fields;

use App\Enums\FieldMode;
use App\Enums\Fields\StudentOjtField;
use App\Enums\OjtStatus;
use App\Enums\OjtTerm;
use App\Models\StudentOjt as StudentOjtModel;
use Carbon\CarbonInterface;
use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class StudentOjt extends Component {
  public StudentOjtField $field;
  public FieldMode $mode;

  public function __construct(
    string|StudentOjtField $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public ?StudentOjtModel $studentOjt = null,
    public ?bool $required = null,
    public ?bool $disabled = null,
  ) {
    $this->field = is_string($field) ? StudentOjtField::from($field) : $field;
    $this->mode = is_string($mode) ? FieldMode::from($mode) : $mode;
  }

  public function config(): ?array {
    return match ($this->field) {
      StudentOjtField::ACADEMIC_YEAR => [
        'id' => 'academic_year',
        'name' => 'academic_year',
        'label' => 'Academic Year',
        'icon' => 'school',
        'type' => 'text',
        'required' => true,
      ],

      StudentOjtField::TERM => [
        'id' => 'term',
        'name' => 'term',
        'label' => 'Term',
        'icon' => 'event',
        'type' => 'select',
        'options' => OjtTerm::options(),
        'required' => true,
      ],

      StudentOjtField::REQUIRED_HOURS => [
        'id' => 'required_hours',
        'name' => 'required_hours',
        'label' => 'Required Hours',
        'icon' => 'schedule',
        'type' => 'number',
        'required' => true,
      ],

      StudentOjtField::STATUS => [
        'id' => 'status',
        'name' => 'status',
        'label' => 'Status',
        'icon' => 'flag',
        'type' => 'select',
        'options' => OjtStatus::options(),
        'required' => true,
      ],

      StudentOjtField::START_DATE => [
        'id' => 'start_date',
        'name' => 'start_date',
        'label' => 'Start Date',
        'icon' => 'calendar_today',
        'type' => 'date',
        'required' => true,
      ],

      StudentOjtField::END_DATE => [
        'id' => 'end_date',
        'name' => 'end_date',
        'label' => 'End Date',
        'icon' => 'event',
        'type' => 'date',
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
    if (!$this->studentOjt)
      return null;

    $fieldName = $this->config()['name'] ?? $this->field->value;
    $value = $this->studentOjt->{$this->field->value};

    if ($value instanceof \BackedEnum)
      $value = $value->value;

    if ($value instanceof CarbonInterface)
      $value = $value->format('Y-m-d');

    return old($fieldName, $value);
  }

  public function render(): View|Closure|string {
    return view('components.fields.student-ojt');
  }
}