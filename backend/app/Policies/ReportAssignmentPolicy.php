<?php

namespace App\Policies;

use App\Models\ReportAssignment;
use App\Models\User;

class ReportAssignmentPolicy
{
  public function before(User $user): ?bool
  {
    return $user->isAdmin() || $user->isSuperAdmin() ? true : null;
  }

  public function viewAny(User $user): bool { return $user->isAdmin() || $user->isSuperAdmin(); }
  public function view(User $user, ReportAssignment $assignment): bool { return $user->isAdmin() || $user->isSuperAdmin(); }
  public function create(User $user): bool { return $user->isAdmin() || $user->isSuperAdmin(); }
  public function update(User $user, ReportAssignment $assignment): bool { return $user->isAdmin() || $user->isSuperAdmin(); }
  public function delete(User $user, ReportAssignment $assignment): bool { return $user->isAdmin() || $user->isSuperAdmin(); }
  public function restore(User $user, ReportAssignment $assignment): bool { return $user->isAdmin() || $user->isSuperAdmin(); }
}
