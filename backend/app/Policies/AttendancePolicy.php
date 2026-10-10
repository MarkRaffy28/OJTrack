<?php

namespace App\Policies;

use App\Models\Attendance;
use App\Models\User;
use App\Policies\UserPolicy;

class AttendancePolicy
{
    public function before(User $user): ?bool
    {
        return $user->isSuperAdmin() || $user->isAdmin() ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->isInstructor() || $user->isAdmin() || $user->isSupervisor();
    }

    public function create(User $user): bool
    {
        return $user->isInstructor() || $user->isSupervisor();
    }

    public function view(User $user, Attendance $attendance): bool
    {
        if ($user->isSupervisor()) {
            return $attendance->ojt?->supervisor_id === $user->id;
        }

        return $user->isInstructor()
            && app(UserPolicy::class)->instructorCanAccessStudent($user, $attendance->student);
    }

    public function override(User $user, Attendance $attendance): bool
    {
        return $this->view($user, $attendance);
    }
}
