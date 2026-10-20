<?php

namespace App\Http\Requests\Instructor;

use Illuminate\Foundation\Http\FormRequest;

class AttendanceApprovalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isInstructor() && $this->user()?->instructorDetail !== null;
    }

    public function rules(): array
    {
        return [
            'remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
