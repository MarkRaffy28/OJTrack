<?php

namespace App\Policies;

use App\Models\ProgressReport;
use App\Models\User;

class ProgressReportPolicy
{
    public function view(User $user, ProgressReport $report): bool
    {
        $role = $user->role instanceof \BackedEnum ? $user->role->value : $user->role;

        if (in_array($role, ['instructor', 'adviser'], true)) {
            return true;
        }

        return $user->instructorDetail
            && $report->student->instructor_detail_id === $user->instructorDetail->id;
    }

    public function review(User $user, ProgressReport $report): bool
    {
        return $this->view($user, $report);
    }
}