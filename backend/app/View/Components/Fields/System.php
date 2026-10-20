<?php

namespace App\View\Components\Fields;

use App\Enums\FieldMode;
use App\Enums\Fields\SystemField;
use Illuminate\Database\Eloquent\Model;

class System extends BaseField {
  public function __construct(
    string|SystemField $field,
    string|FieldMode $mode = FieldMode::VIEW,
    public ?Model $model = null,
    public ?bool $disabled = null,
  ) {
    $this->fieldEnum = $this->parseEnum($field, SystemField::class);
    $this->mode = $this->parseMode($mode);
  }

  public function config(): ?array {
    $baseConfig = match ($this->fieldEnum) {
      SystemField::ID => [
        'id' => 'id',
        'name' => 'id',
        'label' => 'ID',
        'icon' => 'hashtag',
        'type' => 'text',
        'readonly' => true,
      ],
      SystemField::CREATED_AT => [
        'id' => 'created_at',
        'name' => 'created_at',
        'label' => 'Created At',
        'icon' => 'calendar',
        'type' => 'datetime',
        'readonly' => true,
      ],
      SystemField::UPDATED_AT => [
        'id' => 'updated_at',
        'name' => 'updated_at',
        'label' => 'Updated At',
        'icon' => 'clock',
        'type' => 'datetime',
        'readonly' => true,
      ],
      SystemField::DELETED_AT => [
        'id' => 'deleted_at',
        'name' => 'deleted_at',
        'label' => 'Deleted At',
        'icon' => 'trash',
        'type' => 'datetime',
        'readonly' => true,
      ],
    };

    if ($this->disabled !== null) {
      $baseConfig['disabled'] = $this->disabled;
    }

    return $baseConfig;
  }

  protected function resolveValue(): mixed {
    if (!$this->model) {
      return null;
    }

    return match ($this->fieldEnum) {
      SystemField::ID => $this->model->getKey(),
      SystemField::CREATED_AT => $this->model->created_at,
      SystemField::UPDATED_AT => $this->model->updated_at,
      SystemField::DELETED_AT => $this->model->deleted_at,
    };
  }
}
