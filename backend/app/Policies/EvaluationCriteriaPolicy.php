<?php

namespace App\Policies;

use App\Models\EvaluationCriteriaConfig;
use App\Models\User;

class EvaluationCriteriaPolicy {
  public function before(User $user): ?bool {
    return $user->isSuperAdmin() || $user->isAdmin() ? true : null;
  }

  public function viewAny(User $user): bool {
    return $user->isAdmin() || $user->isSuperAdmin();
  }

  public function view(User $user, ?EvaluationCriteriaConfig $config = null): bool {
    return $user->isAdmin() || $user->isSuperAdmin();
  }

  public function create(User $user): bool {
    return $user->isAdmin() || $user->isSuperAdmin();
  }

  public function update(User $user, ?EvaluationCriteriaConfig $config = null): bool {
    return $user->isAdmin() || $user->isSuperAdmin();
  }

  public function delete(User $user, ?EvaluationCriteriaConfig $config = null): bool {
    return $user->isAdmin() || $user->isSuperAdmin();
  }
}
