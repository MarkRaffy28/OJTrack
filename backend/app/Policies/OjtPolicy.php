<?php

namespace App\Policies;

use App\Models\Ojt;
use App\Models\User;

class OjtPolicy {
  public function before(User $user, string $ability): ?bool {
    if ($user->isSuperAdmin() || $user->isAdmin()) {
      return $ability === 'delete' ? null : true;
    }

    return null;
  }

  public function viewAny(User $user): bool { return $user->isAdmin() || $user->isSuperAdmin(); }
  public function view(User $user, Ojt $ojt): bool { return $user->isAdmin() || $user->isSuperAdmin(); }
  public function create(User $user): bool { return $user->isAdmin() || $user->isSuperAdmin(); }
  public function update(User $user, Ojt $ojt): bool { return $user->isAdmin() || $user->isSuperAdmin(); }
  public function delete(User $user, Ojt $ojt): bool {
    return ($user->isAdmin() || $user->isSuperAdmin())
      && !$ojt->studentOjts()->exists();
  }
}
