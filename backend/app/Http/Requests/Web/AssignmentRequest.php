<?php

namespace App\Http\Requests\Web;

use App\Enums\OjtStatus;
use App\Enums\OjtTerm;
use App\Rules\AssignmentRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class AssignmentRequest extends FormRequest {
  public function authorize(): bool {
    return true;
  }

  public function rules(): array {
    $studentOjt = $this->route("studentOjt");

    return [
      "student_id" => AssignmentRules::studentId(),
      "supervisor_id" => AssignmentRules::supervisorId(),
      "office_id" => AssignmentRules::officeId(),
      "academic_year" => AssignmentRules::academicYear(
        $this->input("student_id"),
        $this->input("term"),
        $studentOjt?->id
      ),
      "term" => ["required", new Enum(OjtTerm::class)],
      "required_hours" => AssignmentRules::requiredHours(),
      "status" => ["required", new Enum(OjtStatus::class)],
      "start_date" => AssignmentRules::startDate(),
      "end_date" => AssignmentRules::endDate(),
    ];
  }
}