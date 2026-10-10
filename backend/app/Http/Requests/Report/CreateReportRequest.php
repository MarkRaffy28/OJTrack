<?php

namespace App\Http\Requests\Report;

use App\Http\Requests\BaseApiRequest;

class CreateReportRequest extends BaseApiRequest {
  public function authorize(): bool {
    return true;
  }

  public function rules(): array {
    return [
      'type'       => ['required', 'string', 'in:daily,weekly,monthly,midterm,final,incident'],
      'reportDate' => ['required', 'date'],
      'documents'  => ['nullable', 'array'],
      'documents.*' => ['file', 'mimes:pdf,doc,docx,jpg,jpeg,png', 'max:10240'],
    ];
  }
}
