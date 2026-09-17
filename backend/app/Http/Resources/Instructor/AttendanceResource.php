<?php

namespace App\Http\Resources\Instructor;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'       => $this->id,
            'student'  => $this->student?->name,
            'date'     => $this->date,
            'time_in'  => $this->time_in,
            'time_out' => $this->time_out,
            'status'   => $this->status,
            'hours'    => $this->hours,
        ];
    }
}