<?php

namespace App\Http\Requests\Report;

use App\Http\Requests\BaseApiRequest;

class CreateReportRequest extends BaseApiRequest {
  public function authorize(): bool {
    return true;
  }

  public function rules(): array {
    return [
      'reportAssignmentId' => ['required', 'integer', 'exists:report_assignments,id'],
      'reportDate' => ['nullable', 'date'],
      'documents'  => ['nullable', 'array'],
      'documents.*' => ['file', 'mimes:pdf,doc,docx,jpg,jpeg,png', 'max:10240'],
    ];
  }
}
