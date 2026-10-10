<?php

namespace App\Http\Requests\Web;

use App\Enums\OjtStatus;
use App\Rules\AssignmentRules;
use Illuminate\Validation\Rule;
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
      "office_id" => AssignmentRules::officeId(),
      "required_hours" => AssignmentRules::requiredHours(),
      "status" => ["required", new Enum(OjtStatus::class)],
      "ojt_id" => [
        'required', 'integer', 'exists:ojts,id',
        Rule::unique('student_ojts', 'ojt_id')->where(fn ($q) => $q->where('student_id', $this->input('student_id')))->ignore($studentOjt?->id),
      ],
      "report_deadlines" => ['nullable', 'array'],
      "report_deadlines.daily" => ['nullable', 'date'],
      "report_deadlines.weekly" => ['nullable', 'date'],
      "report_deadlines.monthly" => ['nullable', 'date'],
    ];
  }
}
