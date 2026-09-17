<?php

namespace App\Http\Resources;

use App\Utils\ProfilePictureUtil;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentOjtResource extends JsonResource {
  /**
   * Transform the resource into an array.
   *
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array {
    return [
      'id' => $this->id,

      'student' => $this->student ? [
        'id' => $this->student->id,
        'profilePicture' => ProfilePictureUtil::toBase64($this->student->profile_picture),
        'fullName' => $this->student->full_name,
        'userId' => $this->student->user_id,
        'role' => $this->student->role?->value ?? $this->student->role,
      ] : null,

      'supervisor' => $this->supervisor ? [
        'id' => $this->supervisor->id,
        'profilePicture' => ProfilePictureUtil::toBase64($this->supervisor->profile_picture),
        'fullName' => $this->supervisor->full_name,
        'contactNumber' => $this->supervisor->contact_number,
        'email' => $this->supervisor->email,
        'role' => $this->supervisor->role?->value ?? $this->supervisor->role,
        'supervisorDetail' => $this->supervisor->supervisorDetail ? [
          'position' => $this->supervisor->supervisorDetail->position,
        ] : null,
      ] : null,

      'office' => OfficeResource::make($this->office),
      'academicYear' => $this->academic_year,
      'term' => $this->term?->value ?? $this->term,
      'requiredHours' => (float) $this->required_hours,
      'renderedHours' => (float) $this->rendered_hours,
      'status' => $this->status?->value ?? $this->status,
      'startDate' => $this->start_date?->format('Y-m-d'),
      'endDate' => $this->end_date?->format('Y-m-d'),
    ];
  }
}
