<?php

namespace App\Http\Requests\Web;

use App\Rules\OfficeRules;
use Illuminate\Foundation\Http\FormRequest;

class OfficeRequest extends FormRequest {
  public function authorize(): bool {
    return true;
  }

  public function rules(): array {
    $id = $this->route("office")?->id;

    return [
      "name" => OfficeRules::name($id),
      "address" => OfficeRules::address(),
      "contact_email" => OfficeRules::contactEmail(),
      "contact_phone" => OfficeRules::contactPhone(),

      "morning_in" => OfficeRules::morningIn(),
      "morning_out" => OfficeRules::morningOut(),
      "afternoon_in" => OfficeRules::afternoonIn(),
      "afternoon_out" => OfficeRules::afternoonOut(),
    ];
  }
}