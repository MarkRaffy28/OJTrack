<?php

namespace App\Policies;

use App\Models\Setting;
use App\Models\User;

class SettingPolicy {
  public function before(User $user): ?bool {
    return $user->isSuperAdmin() || $user->isAdmin() ? true : null;
  }

  public function viewAny(User $user): bool {
    return $user->isAdmin() || $user->isSuperAdmin();
  }

  public function view(User $user, ?Setting $setting = null): bool {
    return $user->isAdmin() || $user->isSuperAdmin();
  }

  public function create(User $user): bool {
    return $user->isAdmin() || $user->isSuperAdmin();
  }

  public function update(User $user, ?Setting $setting = null): bool {
    return $user->isAdmin() || $user->isSuperAdmin();
  }

  public function delete(User $user, ?Setting $setting = null): bool {
    return $user->isAdmin() || $user->isSuperAdmin();
  }
}
