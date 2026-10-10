<?php

namespace App\View\Components\Fields;

use App\Enums\FieldMode;
use App\Enums\Fields\ReportField;
use App\Enums\ReportStatus;
use App\Enums\ReportType;

class Report extends BaseField {
  public function __construct(
    string|ReportField $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public mixed $value = null,
    public array $options = [],
    public ?bool $required = null,
    public ?bool $disabled = null,
  ) {
    $this->fieldEnum = $this->parseEnum($field, ReportField::class);
    $this->mode = $this->parseMode($mode);
  }

  public function config(): ?array {
    $baseConfig = match ($this->fieldEnum) {
      ReportField::STUDENT_ID => [
        'id' => 'student_id',
        'name' => 'student_id',
        'label' => 'Student',
        'icon' => 'person',
        'type' => 'select',
        'searchable' => true,
        'required' => true,
      ],
      ReportField::OJT_ID => [
        'id' => 'ojt_id',
        'name' => 'ojt_id',
        'label' => 'Assignment',
        'icon' => 'assignment',
        'type' => 'select',
        'searchable' => true,
        'required' => true,
      ],
      ReportField::TYPE => [
        'id' => 'type',
        'name' => 'type',
        'label' => 'Report Type',
        'icon' => 'description',
        'type' => 'select',
        'options' => ReportType::options(),
        'required' => true,
      ],
      ReportField::REPORT_DATE => [
        'id' => 'report_date',
        'name' => 'report_date',
        'label' => 'Report Date',
        'icon' => 'calendar_today',
        'type' => 'date',
        'required' => true,
      ],
      ReportField::DEADLINE => [
        'id' => 'deadline', 'name' => 'deadline', 'label' => 'Deadline', 'icon' => 'event',
        'type' => 'date', 'required' => false, 'disabled' => true,
      ],
      ReportField::DOCUMENT_PATHS => [
        'id' => 'document_paths',
        'name' => 'document_paths',
        'label' => 'Documents',
        'icon' => 'picture_as_pdf',
        'type' => 'file',
        'accept' => '.pdf,application/pdf',
        'multiple' => true,
        'max_files' => 3,
        'required' => false,
      ],
      ReportField::STATUS => [
        'id' => 'status',
        'name' => 'status',
        'label' => 'Status',
        'icon' => 'flag',
        'type' => 'select',
        'options' => ReportStatus::options(),
        'required' => true,
      ],
      ReportField::REVIEWED_BY => [
        'id' => 'reviewed_by',
        'name' => 'reviewed_by',
        'label' => 'Reviewed By',
        'icon' => 'person',
        'type' => 'select',
        'searchable' => true,
        'required' => false,
      ],
      ReportField::REVIEWED_AT => [
        'id' => 'reviewed_at',
        'name' => 'reviewed_at',
        'label' => 'Reviewed At',
        'icon' => 'schedule',
        'type' => 'datetime-local',
        'required' => false,
      ],
      ReportField::FEEDBACK => [
        'id' => 'feedback',
        'name' => 'feedback',
        'label' => 'Feedback',
        'icon' => 'feedback',
        'type' => 'textarea',
        'required' => false,
      ],
    };

    if (!empty($this->options)) {
      $baseConfig['options'] = $this->options;
    }

    if ($this->required !== null) {
      $baseConfig['required'] = $this->required;
    }

    if ($this->disabled !== null) {
      $baseConfig['disabled'] = $this->disabled;
    }

    return $baseConfig;
  }

  /**
   * Provide raw value to the BaseField resolution and formatting pipeline.
   */
  protected function resolveValue(): mixed {
    return $this->value;
  }

  public function disabled(): bool {
    return $this->disabled ?? parent::disabled();
  }
}
