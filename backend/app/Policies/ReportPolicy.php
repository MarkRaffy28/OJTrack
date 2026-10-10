<?php

namespace App\Policies;

use App\Models\Report;
use App\Models\User;

class ReportPolicy
{
    public function before(User $user): ?bool
    {
        return $user->isSuperAdmin() || $user->isAdmin() ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->isInstructor() || $user->isSupervisor();
    }

    public function view(User $user, Report $report): bool
    {
        return $user->isInstructor()
            && app(UserPolicy::class)->instructorCanAccessStudent($user, $report->student);
    }

    public function create(User $user): bool
    {
        return $user->isInstructor();
    }

    public function update(User $user, Report $report): bool
    {
        return $this->view($user, $report);
    }

    public function delete(User $user, Report $report): bool
    {
        return $this->view($user, $report);
    }
}
