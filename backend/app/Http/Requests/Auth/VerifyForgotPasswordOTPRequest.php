<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseApiRequest;
use App\Rules\AuthRules;

class VerifyForgotPasswordOTPRequest extends BaseApiRequest {
  public function authorize(): bool {
    return true;
  }

  public function rules(): array {
    return [
      "email" => ["required", "email", "max:100"],
      "otp" => AuthRules::otp(),
    ];
  }
}
