<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseApiRequest;
use App\Rules\AuthRules;

class EmailVerificationRequest extends BaseApiRequest {
  public function authorize(): bool {
    return true;
  }

  public function rules(): array {
    return [
      "otp" => AuthRules::otp(),
    ];
  }
}
