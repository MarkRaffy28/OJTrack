<?php

namespace App\Http\Requests\Web;

use App\Rules\ReportRules;
use Illuminate\Foundation\Http\FormRequest;

class ReportRequest extends FormRequest {
  public function authorize(): bool {
    return true;
  }

  public function rules(): array {
    return [
      "student_id" => ReportRules::studentId(),
      // The OJT record is resolved from the selected student by the controller.
      // It is optional here so the edit form does not expose an internal OJT id.
      "ojt_id" => ["sometimes", "nullable", "integer", "exists:student_ojts,id"],
      "report_assignment_id" => ["required", "integer", "exists:report_assignments,id"],
      "report_date" => ReportRules::reportDate(),
      "document_paths" => ReportRules::documentPaths(),
      "document_paths.*" => ReportRules::documentPath(),
      "status" => ReportRules::status(),
      "reviewed_by" => ReportRules::reviewedBy(),
      "reviewed_at" => ReportRules::reviewedAt(),
      "feedback" => ReportRules::feedback(),
    ];
  }
}
