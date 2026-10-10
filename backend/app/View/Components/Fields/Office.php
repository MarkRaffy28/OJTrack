<?php

namespace App\View\Components\Fields;

use App\Enums\FieldMode;
use App\Enums\Fields\OfficeField;
use App\Models\Office as OfficeModel;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;

class Office extends BaseField {
  public function __construct(
    string|OfficeField $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public ?OfficeModel $office = null,
    public ?bool $required = null,
    public ?bool $disabled = null,
  ) {
    $this->fieldEnum = $this->parseEnum($field, OfficeField::class);
    $this->mode = $this->parseMode($mode);
  }

  public function config(): ?array {
    $baseConfig = match ($this->fieldEnum) {
      OfficeField::NAME => [
        'id' => 'name',
        'name' => 'name',
        'label' => 'Office Name',
        'icon' => 'business',
        'type' => 'text',
        'required' => true,
      ],
      OfficeField::ADDRESS => [
        'id' => 'address',
        'name' => 'address',
        'label' => 'Address',
        'icon' => 'location_on',
        'type' => 'text',
        'required' => false,
      ],
      OfficeField::CONTACT_EMAIL => [
        'id' => 'contact_email',
        'name' => 'contact_email',
        'label' => 'Contact Email',
        'icon' => 'mail',
        'type' => 'email',
        'required' => false,
      ],
      OfficeField::CONTACT_PHONE => [
        'id' => 'contact_phone',
        'name' => 'contact_phone',
        'label' => 'Contact Phone',
        'icon' => 'phone',
        'type' => 'tel',
        'required' => false,
      ],
      OfficeField::MORNING_IN => [
        'id' => 'morning_in',
        'name' => 'morning_in',
        'label' => 'Morning In',
        'icon' => 'login',
        'type' => 'time',
        'required' => true,
      ],
      OfficeField::MORNING_OUT => [
        'id' => 'morning_out',
        'name' => 'morning_out',
        'label' => 'Morning Out',
        'icon' => 'logout',
        'type' => 'time',
        'required' => true,
      ],
      OfficeField::AFTERNOON_IN => [
        'id' => 'afternoon_in',
        'name' => 'afternoon_in',
        'label' => 'Afternoon In',
        'icon' => 'login',
        'type' => 'time',
        'required' => true,
      ],
      OfficeField::AFTERNOON_OUT => [
        'id' => 'afternoon_out',
        'name' => 'afternoon_out',
        'label' => 'Afternoon Out',
        'icon' => 'logout',
        'type' => 'time',
        'required' => true,
      ],
    };

    if ($this->required !== null) {
      $baseConfig['required'] = $this->required;
    }

    if ($this->disabled !== null) {
      $baseConfig['disabled'] = $this->disabled;
    }

    return $baseConfig;
  }

  /**
   * Resolve explicit attribute values from the Office model.
   */
  protected function resolveValue(): mixed {
    if (!$this->office) {
      return null;
    }

    return match ($this->fieldEnum) {
      OfficeField::NAME => $this->office->name,
      OfficeField::ADDRESS => $this->office->address,
      OfficeField::CONTACT_EMAIL => $this->office->contact_email,
      OfficeField::CONTACT_PHONE => $this->office->contact_phone,
      OfficeField::MORNING_IN => $this->office->morning_in,
      OfficeField::MORNING_OUT => $this->office->morning_out,
      OfficeField::AFTERNOON_IN => $this->office->afternoon_in,
      OfficeField::AFTERNOON_OUT => $this->office->afternoon_out,
    };
  }

  /**
   * Format time field values to standard HTML time format (H:i).
   */
  protected function formatValue(mixed $value): mixed {
    if (!$value) {
      return parent::formatValue($value);
    }

    $isTimeField = in_array($this->fieldEnum, [
      OfficeField::MORNING_IN,
      OfficeField::MORNING_OUT,
      OfficeField::AFTERNOON_IN,
      OfficeField::AFTERNOON_OUT,
    ], true);

    if ($isTimeField) {
      if ($value instanceof CarbonInterface) {
        return $value->format('H:i');
      }

      return Carbon::parse($value)->format('H:i');
    }

    return parent::formatValue($value);
  }

  public function disabled(): bool {
    return $this->disabled ?? parent::disabled();
  }
}
