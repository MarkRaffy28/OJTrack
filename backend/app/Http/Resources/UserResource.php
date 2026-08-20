<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource {
  /**
   * Transform the resource into an array.
   *
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array {
    return [
      'id' => $this->id,

      'username' => $this->username,

      'profilePicture' => $this->profile_picture,

      'firstName' => $this->first_name,
      'middleName' => $this->middle_name,
      'lastName' => $this->last_name,
      'extensionName' => $this->extension_name,
      'fullName' => $this->full_name,

      'userId' => $this->user_id,

      'birthDate' => $this->birth_date->toDateString(),

      'gender' => $this->gender,

      'homeAddress' => $this->home_address,
      'presentAddress' => $this->present_address,
      'contactNumber' => $this->contact_number,

      'email' => $this->email,
      'emailVerifiedAt' => $this->email_verified_at,

      'role' => $this->role,

      'status' => $this->status,
      'activatedAt' => $this->activated_at,

      'studentDetail' => $this->when(
        $this->role === 'student',
        fn() => StudentDetailResource::make($this->studentDetail),
      ),

      'instructorDetail' => $this->when(
        $this->role === 'instructor',
        fn() => InstructorDetailResource::make($this->instructorDetail),
      ),

      'supervisorDetail' => $this->when(
        $this->role === 'supervisor',
        fn() => SupervisorDetailResource::make($this->supervisorDetail),
      ),

      'emergencyContacts' => $this->when(
        $this->role === 'student',
        fn() => EmergencyContactResource::collection($this->emergencyContacts),
      ),

      'createdAt' => $this->created_at,
      'updatedAt' => $this->updated_at,
    ];
  }
}
