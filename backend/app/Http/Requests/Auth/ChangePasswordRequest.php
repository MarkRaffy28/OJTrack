<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseApiRequest;
use App\Rules\AuthRules;

class ChangePasswordRequest extends BaseApiRequest {
  public function authorize(): bool {
    return true;
  }

  public function rules(): array {
    return [
      "currentPassword" => AuthRules::currentPassword(),
      "newPassword" => AuthRules::newPassword(),
      "confirmPassword" => AuthRules::confirmPassword(),
    ];
  }
}