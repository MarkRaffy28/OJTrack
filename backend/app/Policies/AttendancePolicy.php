<?php

namespace App\Policies;

use App\Models\Attendance;
use App\Models\User;

class AttendancePolicy
{
    // ASSUMPTION: Attendance has a `student()` relation to StudentDetail.
    // Verify this matches your actual Attendance model.
    public function view(User $user, Attendance $attendance): bool
    {
        $role = $user->role instanceof \BackedEnum ? $user->role->value : $user->role;

        if (in_array($role, ['instructor', 'adviser'], true)) {
            return true;
        }

        return $user->instructorDetail
            && $attendance->student->instructor_detail_id === $user->instructorDetail->id;
    }

    public function override(User $user, Attendance $attendance): bool
    {
        return $this->view($user, $attendance);
    }
}