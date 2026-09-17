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
      "ojt_id" => ReportRules::ojtId(),
      "type" => ReportRules::type(),
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