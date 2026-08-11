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

      'profile_picture' => $this->profile_picture,

      'first_name' => $this->first_name,
      'middle_name' => $this->middle_name,
      'last_name' => $this->last_name,
      'extension_name' => $this->extension_name,
      'full_name' => $this->full_name,

      'user_id' => $this->user_id,

      'birth_date' => $this->birth_date->toDateString(),

      'gender' => $this->gender,

      'address' => $this->address,
      'contact_number' => $this->contact_number,

      'email' => $this->email,
      'email_verified_at' => $this->email_verified_at,

      'role' => $this->role,

      'status' => $this->status,
      'activated_at' => $this->activated_at,

      'student_detail' => $this->when(
        $this->role === 'student',
        fn() => StudentDetailResource::make($this->studentDetail),
      ),

      'instructor_detail' => $this->when(
        $this->role === 'instructor',
        fn() => InstructorDetailResource::make($this->instructorDetail),
      ),

      'supervisor_detail' => $this->when(
        $this->role === 'supervisor',
        fn() => SupervisorDetailResource::make($this->supervisorDetail),
      ),

      'created_at' => $this->created_at,
      'updated_at' => $this->updated_at,
    ];
  }
}
