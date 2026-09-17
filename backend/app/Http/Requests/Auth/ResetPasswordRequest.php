<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseApiRequest;
use App\Rules\AuthRules;

class ResetPasswordRequest extends BaseApiRequest {
  public function authorize(): bool {
    return true;
  }

  public function rules(): array {
    return [
      "email" => ["required", "email", "max:100"],
      "newPassword" => AuthRules::newPassword(),
      "confirmPassword" => AuthRules::confirmPassword(),
    ];
  }
}
