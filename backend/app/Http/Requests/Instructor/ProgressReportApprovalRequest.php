<?php

namespace App\Http\Requests\Instructor;

use Illuminate\Foundation\Http\FormRequest;

class ProgressReportApprovalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->instructor !== null;
    }

    public function rules(): array
    {
        return [
            'status'  => ['required', 'in:approved,rejected'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }
}