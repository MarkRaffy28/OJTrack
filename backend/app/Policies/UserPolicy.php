<?php

namespace App\Policies;

use App\Enums\UserRoles;
use App\Models\User;

class UserPolicy {
  /**
   * Admin has unrestricted access.
   */
  public function before(User $user, string $ability): ?bool {
    if ($user->role === UserRoles::ADMIN) {
      return true;
    }

    return null;
  }

  /**
   * View the list of users.
   */
  public function viewAny(User $user): bool {
    return $user->role === UserRoles::INSTRUCTOR;
  }

  /**
   * View a specific user.
   */
  public function view(User $user, User $targetUser): bool {
    return $user->role === UserRoles::INSTRUCTOR;
  }

  /**
   * Create a user.
   */
  public function create(User $user): bool {
    return $user->role === UserRoles::INSTRUCTOR;
  }

  /**
   * Update a user.
   */
  public function update(User $user, User $targetUser): bool {
    return $user->role === UserRoles::INSTRUCTOR;
  }

  /**
   * Delete a user.
   */
  public function delete(User $user, User $targetUser): bool {
    return $user->role === UserRoles::INSTRUCTOR
      && $user->id !== $targetUser->id;
  }
}