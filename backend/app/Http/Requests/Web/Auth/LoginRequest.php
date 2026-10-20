<?php

namespace App\Http\Requests\Web\Auth;

use App\Rules\AuthRules;
use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest {
  public function authorize(): bool {
    return true;
  }

  public function rules(): array {
    return [
      "identifier" => AuthRules::identifier(),
      "password" => AuthRules::password(),
    ];
  }
}
