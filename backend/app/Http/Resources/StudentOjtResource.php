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
    $hasStudent = $this->relationLoaded('student') && $this->student;
    $hasSupervisor = $this->relationLoaded('supervisor') && $this->supervisor;
    $hasOffice = $this->relationLoaded('office') && $this->office;
    $ojt = $this->relationLoaded('ojt') ? $this->ojt : null;

    return [
      'id' => $this->id,

      'student' => $hasStudent ? [
        'id' => $this->student->id,
        'profilePicture' => ProfilePictureUtil::toBase64($this->student->profile_picture),
        'fullName' => $this->student->full_name,
        'userId' => $this->student->user_id,
        'role' => $this->student->role?->value ?? $this->student->role,
      ] : null,

      'supervisor' => $hasSupervisor ? [
        'id' => $this->supervisor->id,
        'profilePicture' => ProfilePictureUtil::toBase64($this->supervisor->profile_picture),
        'fullName' => $this->supervisor->full_name,
        'contactNumber' => $this->supervisor->contact_number,
        'email' => $this->supervisor->email,
        'role' => $this->supervisor->role?->value ?? $this->supervisor->role,
        'supervisorDetail' => ($this->supervisor->relationLoaded('supervisorDetail') && $this->supervisor->supervisorDetail) ? [
          'position' => $this->supervisor->supervisorDetail->position,
        ] : null,
      ] : null,

      'office' => $hasOffice ? OfficeResource::make($this->office) : null,
      'academicYear' => $ojt?->academic_year,
      'term' => $ojt?->term?->value ?? $ojt?->term,
      'requiredHours' => (float) $this->required_hours,
      'renderedHours' => (float) $this->rendered_hours,
      'status' => $this->status?->value ?? $this->status,
      'startDate' => $ojt?->start_date?->format('Y-m-d'),
      'endDate' => $ojt?->end_date?->format('Y-m-d'),
    ];
  }
}
