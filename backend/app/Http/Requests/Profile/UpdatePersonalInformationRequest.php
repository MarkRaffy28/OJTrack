<?php

namespace App\Http\Requests\Profile;

use App\Http\Requests\BaseApiRequest;
use App\Rules\UserRules;

class UpdatePersonalInformationRequest extends BaseApiRequest {
  public function authorize(): bool {
    return true;
  }

  public function rules(): array {
    $userId = $this->user()?->id;

    return [
      'username' => UserRules::username($userId),

      'firstName' => UserRules::firstName(),
      'middleName' => UserRules::middleName(),
      'lastName' => UserRules::lastName(),
      'extensionName' => UserRules::extensionName(),

      'birthDate' => UserRules::birthDate(),
      'gender' => UserRules::gender(),

      'homeAddress' => UserRules::homeAddress(),
      'presentAddress' => UserRules::presentAddress(),
      'contactNumber' => UserRules::contactNumber(),
      'email' => UserRules::email($userId),
    ];
  }
}
