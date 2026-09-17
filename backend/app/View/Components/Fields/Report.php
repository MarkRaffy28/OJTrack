<?php

namespace App\View\Components\Fields;

use App\Enums\FieldMode;
use App\Enums\Fields\ReportField;
use App\Enums\ReportStatus;
use App\Enums\ReportType;
use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class Report extends Component {
  public ReportField $field;
  public FieldMode $mode;

  public function __construct(
    string|ReportField $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public mixed $value = null,
    public array $options = [],
    public ?bool $required = null,
    public ?bool $disabled = null,
  ) {
    $this->field = is_string($field) ? ReportField::from($field) : $field;
    $this->mode = is_string($mode) ? FieldMode::from($mode) : $mode;
  }

  public function config(): ?array {
    return match ($this->field) {
      ReportField::STUDENT_ID => [
        "id" => "student_id",
        "name" => "student_id",
        "label" => "Student",
        "icon" => "person",
        "type" => "select",
        "searchable" => true,
        "required" => true,
      ],
      ReportField::OJT_ID => [
        "id" => "ojt_id",
        "name" => "ojt_id",
        "label" => "Assignment",
        "icon" => "assignment",
        "type" => "select",
        "searchable" => true,
        "required" => true,
      ],
      ReportField::TYPE => [
        "id" => "type",
        "name" => "type",
        "label" => "Report Type",
        "icon" => "description",
        "type" => "select",
        "options" => ReportType::options(),
        "required" => true,
      ],
      ReportField::REPORT_DATE => [
        "id" => "report_date",
        "name" => "report_date",
        "label" => "Report Date",
        "icon" => "calendar_today",
        "type" => "date",
        "required" => true,
      ],
      ReportField::DOCUMENT_PATHS => [
        "id" => "document_paths",
        "name" => "document_paths",
        "label" => "Documents",
        "icon" => "picture_as_pdf",
        "type" => "file",
        "accept" => ".pdf,application/pdf",
        "multiple" => true,
        "max_files" => 3,
        "required" => false,
      ],
      ReportField::STATUS => [
        "id" => "status",
        "name" => "status",
        "label" => "Status",
        "icon" => "flag",
        "type" => "select",
        "options" => ReportStatus::options(),
        "required" => true,
      ],
      ReportField::REVIEWED_BY => [
        "id" => "reviewed_by",
        "name" => "reviewed_by",
        "label" => "Reviewed By",
        "icon" => "person",
        "type" => "select",
        "searchable" => true,
        "required" => false,
      ],
      ReportField::REVIEWED_AT => [
        "id" => "reviewed_at",
        "name" => "reviewed_at",
        "label" => "Reviewed At",
        "icon" => "schedule",
        "type" => "datetime-local",
        "required" => false,
      ],
      ReportField::FEEDBACK => [
        "id" => "feedback",
        "name" => "feedback",
        "label" => "Feedback",
        "icon" => "feedback",
        "type" => "textarea",
        "required" => false,
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
    return view("components.fields.report");
  }
}