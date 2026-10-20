<?php

namespace App\Policies;

use App\Models\StudentDetail;
use App\Models\User;

class StudentPolicy {
  public function viewAny(User $user): bool {
    return $user->isAdmin() || $user->isInstructor() || $user->isSupervisor();
  }

  public function view(User $user, StudentDetail $student): bool {
    if ($user->isAdmin() || $user->isSuperAdmin()) {
      return true;
    }

    return $user->isInstructor()
      && app(UserPolicy::class)->instructorCanAccessStudent($user, $student->user);
  }

  public function updateStatus(User $user, StudentDetail $student): bool {
    return $user->isInstructor()
      && app(UserPolicy::class)->instructorCanAccessStudent($user, $student->user);
  }
}
