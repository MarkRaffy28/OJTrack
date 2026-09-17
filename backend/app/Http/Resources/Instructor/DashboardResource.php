<?php

namespace App\Http\Resources\Instructor;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'assigned_students_count'      => $this['assigned_students_count'],
            'students_on_ojt_count'        => $this['students_on_ojt_count'],
            'pending_attendance_requests'  => $this['pending_attendance_requests'],
            'pending_progress_reports'     => $this['pending_progress_reports'],
            'attendance_issues'            => $this['attendance_issues'],
        ];
    }
}