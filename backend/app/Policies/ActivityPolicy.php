<?php

namespace App\Policies;

use App\Models\Activity;
use App\Models\User;

class ActivityPolicy {
  public function before(User $user): ?bool {
    return $user->isSuperAdmin() || $user->isAdmin() ? true : null;
  }

  public function viewAny(User $user): bool {
    return $user->isAdmin() || $user->isSuperAdmin();
  }

  public function view(User $user, Activity $activity): bool {
    return $user->isAdmin() || $user->isSuperAdmin();
  }
}
