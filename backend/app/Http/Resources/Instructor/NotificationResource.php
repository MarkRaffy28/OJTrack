<?php

namespace App\Http\Resources\Instructor;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'type'       => $this->type,
            'message'    => $this->data['message'] ?? null,
            'read_at'    => $this->read_at,
            'created_at' => $this->created_at,
        ];
    }
}