<?php

namespace App\Policies;

use App\Models\StudentDetail;
use App\Models\User;

class StudentPolicy {
  public function viewAny(User $user): bool {
    $role = $user->role instanceof \BackedEnum ? $user->role->value : $user->role;

    return in_array($role, ['instructor', 'adviser'], true) || (bool) $user->instructorDetail;
  }

  public function view(User $user, StudentDetail $student): bool {
    $role = $user->role instanceof \BackedEnum ? $user->role->value : $user->role;

    if (in_array($role, ['instructor', 'adviser'], true)) {
      return true;
    }

    return $user->instructorDetail
      && $student->instructor_detail_id === $user->instructorDetail->id;
  }

  public function updateStatus(User $user, StudentDetail $student): bool {
    $role = $user->role instanceof \BackedEnum ? $user->role->value : $user->role;

    if (in_array($role, ['instructor', 'adviser'], true)) {
      return $user->instructorDetail
        && $student->instructor_detail_id === $user->instructorDetail->id;
    }

    return false;
  }
}