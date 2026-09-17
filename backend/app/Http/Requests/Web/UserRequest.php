<?php

namespace App\Http\Requests\Web;

use App\Rules\AuthRules;
use App\Rules\EmergencyContactsRules;
use App\Rules\InstructorDetailRules;
use App\Rules\StudentDetailRules;
use App\Rules\SupervisorDetailRules;
use App\Rules\UserRules;
use Illuminate\Foundation\Http\FormRequest;

class UserRequest extends FormRequest {
  private function isStudent(): bool {
    return $this->input('role') === 'student';
  }

  private function isSupervisor(): bool {
    return $this->input('role') === 'supervisor';
  }

  private function isInstructor(): bool {
    return $this->input('role') === 'instructor';
  }

  private function isActiveOrSuspended(): bool {
    return $this->input('status') === 'active' ||
      $this->input('status') === 'suspended';
  }

  public function authorize(): bool {
    return true;
  }

  public function rules(): array {
    $required = $this->isActiveOrSuspended();
    $id = $this->route('user')?->id;

    return [
      "user_id" => UserRules::userId($id),
      "profile_picture" => UserRules::profilePicture(),

      "username" => UserRules::username($required, $id),
      "password" => AuthRules::password(false),

      "first_name" => UserRules::firstName(),
      "middle_name" => UserRules::middleName(),
      "last_name" => UserRules::lastName(),
      "extension_name" => UserRules::extensionName(),

      "birth_date" => UserRules::birthDate($required),
      "gender" => UserRules::gender($required),

      "home_address" => UserRules::homeAddress($required),
      "present_address" => UserRules::presentAddress($required),
      "contact_number" => UserRules::contactNumber($required),
      "email" => UserRules::email($required, $id),

      "status" => UserRules::status(),
      "role" => UserRules::role(),

      'year' => StudentDetailRules::year($this->isStudent()),
      'program' => StudentDetailRules::program($this->isStudent()),
      'major' => StudentDetailRules::major($this->isStudent()),
      'section' => StudentDetailRules::section(
        $this->isStudent() || $this->isInstructor()
      ),

      'emergency_contact' => EmergencyContactsRules::emergencyContact(
        $this->isStudent() && $required
      ),
      'emergency_contact.name' => EmergencyContactsRules::name(
        $this->isStudent() && $required
      ),
      'emergency_contact.relationship' => EmergencyContactsRules::relationship(
        $this->isStudent() && $required
      ),
      'emergency_contact.contact_number' => EmergencyContactsRules::contactNumber(
        $this->isStudent() && $required
      ),
      'emergency_contact.address' => EmergencyContactsRules::address(
        $this->isStudent() && $required
      ),

      'office_id' => SupervisorDetailRules::officeId($this->isSupervisor()),
      'position' => SupervisorDetailRules::position($this->isSupervisor()),

      'department' => InstructorDetailRules::department($this->isInstructor()),
    ];
  }
}