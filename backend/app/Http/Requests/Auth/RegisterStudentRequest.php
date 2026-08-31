<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseApiRequest;
use App\Rules\AuthRules;
use App\Rules\EmergencyContactsRules;
use App\Rules\UserRules;

class RegisterStudentRequest extends BaseApiRequest {
  public function authorize(): bool {
    return true;
  }

  public function rules(): array {
    $userId = $this->user()?->id;

    return [
      'newPassword' => AuthRules::newPassword(),
      'confirmPassword' => AuthRules::confirmPassword(),

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

      'emergencyContact' => EmergencyContactsRules::emergencyContact(),
      'emergencyContact.name' => EmergencyContactsRules::name(),
      'emergencyContact.relationship' => EmergencyContactsRules::relationship(),
      'emergencyContact.contactNumber' => EmergencyContactsRules::contactNumber(),
      'emergencyContact.address' => EmergencyContactsRules::address(),
    ];
  }
}