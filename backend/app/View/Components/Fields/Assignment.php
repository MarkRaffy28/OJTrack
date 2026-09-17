<?php

namespace App\View\Components\Fields;

use App\Enums\FieldMode;
use App\Enums\Fields\AssignmentField;
use App\Enums\OjtStatus;
use App\Enums\OjtTerm;
use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class Assignment extends Component {
  public AssignmentField $field;
  public FieldMode $mode;

  public function __construct(
    string|AssignmentField $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public mixed $value = null,
    public array $options = [],
    public ?bool $required = null,
    public ?bool $disabled = null,
  ) {
    $this->field = is_string($field) ? AssignmentField::from($field) : $field;
    $this->mode = is_string($mode) ? FieldMode::from($mode) : $mode;
  }

  public function config(): ?array {
    return match ($this->field) {
      AssignmentField::STUDENT_ID => [
        "id" => "student_id",
        "name" => "student_id",
        "label" => "Student",
        "icon" => "person",
        "type" => "select",
        "searchable" => true,
        "required" => true,
      ],
      AssignmentField::SUPERVISOR_ID => [
        "id" => "supervisor_id",
        "name" => "supervisor_id",
        "label" => "Supervisor",
        "icon" => "supervisor_account",
        "type" => "select",
        "searchable" => true,
        "required" => false,
      ],
      AssignmentField::OFFICE_ID => [
        "id" => "office_id",
        "name" => "office_id",
        "label" => "Office",
        "icon" => "business",
        "type" => "select",
        "searchable" => true,
        "required" => true,
      ],
      AssignmentField::ACADEMIC_YEAR => [
        "id" => "academic_year",
        "name" => "academic_year",
        "label" => "Academic Year",
        "icon" => "school",
        "type" => "text",
        "required" => true,
      ],
      AssignmentField::TERM => [
        "id" => "term",
        "name" => "term",
        "label" => "Term",
        "icon" => "event",
        "type" => "select",
        "options" => OjtTerm::options(),
        "required" => true,
      ],
      AssignmentField::REQUIRED_HOURS => [
        "id" => "required_hours",
        "name" => "required_hours",
        "label" => "Required Hours",
        "icon" => "schedule",
        "type" => "number",
        "required" => true,
      ],
      AssignmentField::STATUS => [
        "id" => "status",
        "name" => "status",
        "label" => "Status",
        "icon" => "flag",
        "type" => "select",
        "options" => OjtStatus::options(),
        "required" => true,
      ],
      AssignmentField::START_DATE => [
        "id" => "start_date",
        "name" => "start_date",
        "label" => "Start Date",
        "icon" => "calendar_today",
        "type" => "date",
        "required" => true,
      ],
      AssignmentField::END_DATE => [
        "id" => "end_date",
        "name" => "end_date",
        "label" => "End Date",
        "icon" => "event",
        "type" => "date",
        "required" => true,
      ],
    };
  }

  public function fieldOptions(): array {
    $options = $this->options ?: ($this->config()["options"] ?? []);

    return collect($options)->map(function ($label, $value) {
      if (is_array($label) && isset($label["value"], $label["label"])) {
        return $label;
      }

      return [
        "value" => $value,
        "label" => $label,
      ];
    })->values()->all();
  }

  public function disabled(): bool {
    return $this->disabled ?? ($this->mode === FieldMode::VIEW || ($this->config()["disabled"] ?? false));
  }

  public function readonly(): bool {
    return $this->mode === FieldMode::VIEW || ($this->config()["readonly"] ?? false);
  }

  public function fieldValue(): mixed {
    $fieldName = $this->config()["name"] ?? $this->field->value;

    return old($fieldName, $this->value);
  }

  public function render(): View|Closure|string {
    return view("components.fields.assignment");
  }
}