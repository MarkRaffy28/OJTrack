<?php

namespace App\Http\Requests\Profile;

use App\Http\Requests\BaseApiRequest;
use App\Rules\EmergencyContactsRules;

class UpdateEmergencyContactRequest extends BaseApiRequest {
  public function authorize(): bool {
    return true;
  }

  public function rules(): array {
    return [
      'emergencyContact' => EmergencyContactsRules::emergencyContact(),
      'emergencyContact.name' => EmergencyContactsRules::name(),
      'emergencyContact.relationship' => EmergencyContactsRules::relationship(),
      'emergencyContact.contactNumber' => EmergencyContactsRules::contactNumber(),
      'emergencyContact.address' => EmergencyContactsRules::address(),
    ];
  }
}
