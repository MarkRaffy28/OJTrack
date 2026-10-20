<?php

namespace App\Policies;

use App\Models\Backup;
use App\Models\User;

class BackupPolicy {
  public function before(User $user): ?bool {
    return $user->isSuperAdmin() || $user->isAdmin() ? true : null;
  }

  public function viewAny(User $user): bool {
    return $user->isAdmin() || $user->isSuperAdmin();
  }

  public function view(User $user, ?Backup $backup = null): bool {
    return $user->isAdmin() || $user->isSuperAdmin();
  }

  public function create(User $user): bool {
    return $user->isAdmin() || $user->isSuperAdmin();
  }

  public function restore(User $user): bool {
    return $user->isAdmin() || $user->isSuperAdmin();
  }

  public function download(User $user): bool {
    return $user->isAdmin() || $user->isSuperAdmin();
  }

  public function delete(User $user, ?Backup $backup = null): bool {
    return $user->isAdmin() || $user->isSuperAdmin();
  }
}
