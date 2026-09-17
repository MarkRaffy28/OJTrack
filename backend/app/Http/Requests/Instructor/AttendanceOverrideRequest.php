<?php

namespace App\Http\Requests\Instructor;

use Illuminate\Foundation\Http\FormRequest;

class AttendanceOverrideRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->instructor !== null;
    }

    public function rules(): array
    {
        return [
            'status'   => ['required', 'in:present,late,absent,excused'],
            'time_in'  => ['nullable', 'date_format:H:i'],
            'time_out' => ['nullable', 'date_format:H:i', 'after:time_in'],
            'remarks'  => ['nullable', 'string', 'max:1000'],
        ];
    }
}