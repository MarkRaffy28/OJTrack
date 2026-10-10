<?php

namespace App\Policies;

use App\Models\Office;
use App\Models\User;

class OfficePolicy
{
    public function before(User $user): ?bool
    {
        return $user->isSuperAdmin() || $user->isAdmin() ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->isInstructor() || $user->isSupervisor();
    }

    public function view(User $user, Office $office): bool
    {
        return $user->isInstructor() || $user->isSupervisor();
    }

    public function create(User $user): bool { return $user->isInstructor(); }
    public function update(User $user, Office $office): bool { return $user->isInstructor(); }
    public function delete(User $user, Office $office): bool { return $user->isInstructor(); }
}
