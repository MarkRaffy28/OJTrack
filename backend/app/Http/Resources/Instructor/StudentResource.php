<?php

namespace App\Http\Resources\Instructor;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $required  = (float) ($this->required_hours ?? 486);
        $completed = (float) ($this->completed_hours ?? 0);

        return [
            'id'               => $this->id,
            'name'             => $this->name,
            'company'          => $this->company?->name,
            'required_hours'   => $required,
            'completed_hours'  => $completed,
            'remaining_hours'  => max($required - $completed, 0),
            'progress_percent' => $required > 0 ? round(($completed / $required) * 100, 1) : 0,
            'status'           => $this->status ?? 'ongoing',
        ];
    }
}