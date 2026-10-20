<?php

namespace App\Http\Requests\Report;

use App\Http\Requests\BaseApiRequest;

class UpdateReportRequest extends BaseApiRequest {
  public function authorize(): bool {
    return true;
  }

  public function rules(): array {
    return [
      'reportDate' => ['sometimes', 'date'],
      'documents'  => ['nullable', 'array'],
      'documents.*' => ['file', 'mimes:pdf,doc,docx,jpg,jpeg,png', 'max:10240'],
    ];
  }
}
