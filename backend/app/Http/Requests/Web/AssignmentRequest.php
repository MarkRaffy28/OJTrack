<?php

namespace App\Http\Requests\Web;

use App\Enums\OjtStatus;
use App\Enums\OjtTerm;
use App\Models\InstructorDetail;
use App\Models\StudentDetail;
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
      "instructor_id" => AssignmentRules::instructorId(),
      "office_id" => AssignmentRules::officeId(),
      "required_hours" => AssignmentRules::requiredHours(),
      "status" => ["required", new Enum(OjtStatus::class)],
      "ojt_id" => [
        'required', 'integer', 'exists:ojts,id',
        Rule::unique('student_ojts', 'ojt_id')->where(fn ($q) => $q->where('student_id', $this->input('student_id')))->ignore($studentOjt?->id),
      ],
    ];
  }

  public function withValidator($validator): void {
    $validator->after(function ($validator) {
      $studentProgram = StudentDetail::query()->where('user_id', $this->input('student_id'))->value('program');
      $instructorProgram = InstructorDetail::query()->where('user_id', $this->input('instructor_id'))->value('program');

      // InstructorDetail casts program to AcademicProgram, while student details
      // store it as a string. Compare their underlying values consistently.
      $studentProgram = $studentProgram?->value ?? $studentProgram;
      $instructorProgram = $instructorProgram?->value ?? $instructorProgram;
      $studentSection = StudentDetail::query()->where('user_id', $this->input('student_id'))->value('section');
      $instructorSection = InstructorDetail::query()->where('user_id', $this->input('instructor_id'))->value('section');

      if (
        ($studentProgram !== null && $studentProgram !== $instructorProgram)
        || ($studentSection !== null && $studentSection !== $instructorSection)
      ) {
        $validator->errors()->add('instructor_id', 'The instructor must be assigned to the student\'s academic program and section.');
      }
    });
  }
}
