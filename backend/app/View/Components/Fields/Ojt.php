<?php

namespace App\View\Components\Fields;

use App\Enums\FieldMode;
use App\Enums\Fields\OjtField;
use App\Models\Ojt as OjtModel;

class Ojt extends BaseField {
  public function __construct(
    string|OjtField $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public ?OjtModel $ojt = null,
    public ?bool $required = null,
    public ?bool $disabled = null,
  ) {
    $this->fieldEnum = $this->parseEnum($field, OjtField::class);
    $this->mode = $this->parseMode($mode);
  }

  public function config(): ?array {
    return match ($this->fieldEnum) {
      OjtField::ACADEMIC_YEAR => ['id' => 'academic_year', 'name' => 'academic_year', 'label' => 'Academic Year', 'icon' => 'school', 'type' => 'text', 'required' => true],
      OjtField::TERM => ['id' => 'term', 'name' => 'term', 'label' => 'Term', 'icon' => 'event', 'type' => 'text', 'required' => true],
      OjtField::START_DATE => ['id' => 'start_date', 'name' => 'start_date', 'label' => 'Start Date', 'icon' => 'calendar_today', 'type' => 'text', 'required' => true],
      OjtField::END_DATE => ['id' => 'end_date', 'name' => 'end_date', 'label' => 'End Date', 'icon' => 'event', 'type' => 'text', 'required' => true],
    };
  }

  protected function resolveValue(): mixed {
    return match ($this->fieldEnum) {
      OjtField::ACADEMIC_YEAR => $this->ojt?->academic_year,
      OjtField::TERM => $this->ojt?->term?->value,
      OjtField::START_DATE => $this->ojt?->start_date?->format('M d, Y'),
      OjtField::END_DATE => $this->ojt?->end_date?->format('M d, Y'),
    };
  }

  public function disabled(): bool {
    return $this->disabled ?? parent::disabled();
  }
}
