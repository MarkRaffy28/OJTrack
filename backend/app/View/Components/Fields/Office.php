<?php

namespace App\View\Components\Fields;

use App\Enums\FieldMode;
use App\Enums\Fields\OfficeField;
use App\Models\Office as OfficeFieldEnum;
use Carbon\Carbon;
use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class Office extends Component {
  public OfficeField $field;
  public FieldMode $mode;

  public function __construct(
    string|OfficeField $field,
    string|FieldMode $mode = FieldMode::EDIT,
    public ?OfficeFieldEnum $office = null,
    public ?bool $required = null,
    public ?bool $disabled = null,
  ) {
    $this->field = is_string($field) ? OfficeField::from($field) : $field;
    $this->mode = is_string($mode) ? FieldMode::from($mode) : $mode;
  }

  public function config(): ?array {
    return match ($this->field) {
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
    if (!$this->office)
      return null;

    $fieldName = $this->config()["name"] ?? $this->field->value;
    $value = $this->office->{$this->field->value};

    if (in_array($this->field, [
      OfficeField::MORNING_IN,
      OfficeField::MORNING_OUT,
      OfficeField::AFTERNOON_IN,
      OfficeField::AFTERNOON_OUT,
    ]) && $value) {
      $value = Carbon::parse($value)->format("H:i");
    }

    return old($fieldName, $value);
  }

  public function render(): View|Closure|string {
    return view('components.fields.office');
  }
}