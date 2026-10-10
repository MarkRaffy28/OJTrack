<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\User;

class UserPolicy {
  private function instructorCanAccessStudent(
    User $instructor,
    User $student
  ): bool {
    if (!$student->isStudent()) {
      return false;
    }

    $section = $instructor->instructorDetail?->section;

    if ($section) {
      return $student->studentDetail?->section === $section;
    }

    return $student->studentOjts()
      ->where('instructor_id', $instructor->id)
      ->exists();
  }

  /**
   * Super Admin has unrestricted access.
   */
  public function before(User $user, string $ability): ?bool {
    if ($user->isSuperAdmin()) {
      return true;
    }

    return null;
  }

  /**
   * View the list of users.
   */
  public function viewAny(User $user): bool {
    return $user->isAdmin() || $user->isInstructor();
  }

  /**
   * View a specific user.
   */
  public function view(User $user, User $target): bool {
    if ($target->isAdmin() || $target->isSuperAdmin()) {
      return false;
    }

    if ($user->isInstructor()) {
      return $this->instructorCanAccessStudent($user, $target);
    }

    return $user->isAdmin();
  }

  /**
   * Create a user.
   */
  public function create(User $user, UserRole $role): bool {
    if ($user->isSuperAdmin()) {
      return in_array($role, [
        UserRole::ADMIN,
        UserRole::INSTRUCTOR,
        UserRole::SUPERVISOR,
        UserRole::STUDENT,
      ], true);
    }

    if ($user->isAdmin()) {
      return in_array($role, [
        UserRole::INSTRUCTOR,
        UserRole::SUPERVISOR,
        UserRole::STUDENT,
      ], true);
    }

    if ($user->isInstructor()) {
      return $role === UserRole::STUDENT;
    }

    return false;
  }

  /**
   * Update a user.
   */
  public function update(User $user, User $targetUser): bool {
    if ($targetUser->isAdmin() || $targetUser->isSuperAdmin()) {
      return false;
    }

    if ($user->isInstructor()) {
      return $this->instructorCanAccessStudent($user, $targetUser);
    }

    return $user->isAdmin();
  }

  /**
   * Delete a user.
   */
  public function delete(User $user, User $targetUser): bool {
    if ($targetUser->isAdmin() || $targetUser->isSuperAdmin()) {
      return false;
    }

    if ($user->isInstructor()) {
      return $user->id !== $targetUser->id
        && $this->instructorCanAccessStudent($user, $targetUser);
    }

    return $user->isAdmin()
      && $user->id !== $targetUser->id;
  }
}
