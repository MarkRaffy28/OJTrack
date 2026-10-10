<?php

namespace App\Policies;

use App\Models\Evaluation;
use App\Models\StudentOjt;
use App\Models\User;

class EvaluationPolicy
{
    public function before(User $user): ?bool
    {
        return $user->isSuperAdmin() || $user->isAdmin() ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->isInstructor() || $user->isSupervisor();
    }

    public function view(User $user, Evaluation $evaluation): bool
    {
        return $this->canAccess($user, $evaluation->studentOjt);
    }

    public function create(User $user, ?StudentOjt $studentOjt = null): bool
    {
        return $studentOjt === null
            ? $user->isInstructor()
            : $this->canAccess($user, $studentOjt);
    }

    public function update(User $user, Evaluation $evaluation): bool
    {
        return $this->canAccess($user, $evaluation->studentOjt);
    }

    public function delete(User $user, Evaluation $evaluation): bool
    {
        return $this->canAccess($user, $evaluation->studentOjt);
    }

    private function canAccess(User $user, ?StudentOjt $studentOjt): bool
    {
        return $user->isInstructor()
            && $studentOjt?->student
            && app(UserPolicy::class)->instructorCanAccessStudent($user, $studentOjt->student);
    }
}
