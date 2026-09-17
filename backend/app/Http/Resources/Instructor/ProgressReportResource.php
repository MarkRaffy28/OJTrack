<?php

namespace App\Http\Resources\Instructor;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProgressReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'student'      => $this->student?->name,
            'title'        => $this->title,
            'status'       => $this->status,
            'submitted_at' => $this->submitted_at,
            'reviewed_at'  => $this->reviewed_at,
            'remarks'      => $this->remarks,
        ];
    }
}