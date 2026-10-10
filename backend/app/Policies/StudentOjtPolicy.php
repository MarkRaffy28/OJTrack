<?php

namespace App\Policies;

use App\Models\StudentOjt;
use App\Models\User;

class StudentOjtPolicy
{
    public function before(User $user): ?bool
    {
        return $user->isSuperAdmin() || $user->isAdmin() ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->isInstructor() || $user->isSupervisor();
    }

    public function view(User $user, StudentOjt $studentOjt): bool
    {
        if ($user->isSupervisor()) {
            return $studentOjt->supervisor?->id === $user->id;
        }

        return $user->isInstructor()
            && app(UserPolicy::class)->instructorCanAccessStudent($user, $studentOjt->student);
    }

    public function create(User $user): bool
    {
        return $user->isInstructor();
    }

    public function update(User $user, StudentOjt $studentOjt): bool
    {
        return $user->isInstructor() && $this->view($user, $studentOjt);
    }

    public function delete(User $user, StudentOjt $studentOjt): bool
    {
        return $this->update($user, $studentOjt);
    }
}
