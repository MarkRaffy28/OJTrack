<?php

namespace App\Http\Requests\Web;

use App\Enums\ReportType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReportAssignmentRequest extends FormRequest
{
  public function authorize(): bool { return true; }

  public function rules(): array
  {
    return [
      'ojt_id' => ['required', 'integer', 'exists:ojts,id'],
      'title' => ['required', 'string', 'max:255'],
      'type' => ['required', Rule::enum(ReportType::class)],
      'due_at' => ['required', 'date'],
      'allow_late_submission' => ['nullable', 'boolean'],
    ];
  }
}
