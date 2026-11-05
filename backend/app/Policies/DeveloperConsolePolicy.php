<?php

namespace App\Policies;

use App\Models\User;

class DeveloperConsolePolicy {
  public function access(User $user): bool {
    return $user->isAdmin() || $user->isSuperAdmin();
  }
}