<?php

namespace App\Traits;

use App\Enums\UserRoles;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

trait ScopesForInstructor {
  /**
   * Scope query to limit results to students belonging to the instructor's section or assigned instructor_detail_id.
   */
  protected function applyInstructorSectionScope(Builder $query, ?User $user = null, string $studentRelation = 'student'): Builder {
    $user = $user ?? auth()->user();

    if (!$user || $user->role !== UserRoles::INSTRUCTOR) {
      return $query;
    }

    $section = $user->instructorDetail?->section;
    $instructorDetailId = $user->instructorDetail?->id;

    if ($studentRelation === 'self' || $studentRelation === '') {
      return $query->where('role', UserRoles::STUDENT->value)
        ->whereHas('studentDetail', function ($q) use ($section, $instructorDetailId) {
          $q->where(function ($sub) use ($section, $instructorDetailId) {
            if ($section) {
              $sub->where('section', $section);
            }
            if ($instructorDetailId) {
              $sub->orWhere('instructor_detail_id', $instructorDetailId);
            }
          });
        });
    }

    return $query->whereHas("{$studentRelation}.studentDetail", function ($q) use ($section, $instructorDetailId) {
      $q->where(function ($sub) use ($section, $instructorDetailId) {
        if ($section) {
          $sub->where('section', $section);
        }
        if ($instructorDetailId) {
          $sub->orWhere('instructor_detail_id', $instructorDetailId);
        }
      });
    });
  }

  /**
   * Check if a specific student belongs to the instructor's section.
   */
  protected function authorizeInstructorStudentAccess(?User $student, ?User $user = null): void {
    $user = $user ?? auth()->user();

    if (!$user || $user->role !== UserRoles::INSTRUCTOR || !$student) {
      return;
    }

    $section = $user->instructorDetail?->section;
    $instructorDetailId = $user->instructorDetail?->id;
    $studentDetail = $student->studentDetail;

    $matchesSection = $section && $studentDetail && $studentDetail->section === $section;
    $matchesDetail = $instructorDetailId && $studentDetail && (int) $studentDetail->instructor_detail_id === (int) $instructorDetailId;

    if (!$matchesSection && !$matchesDetail) {
      abort(403, 'Unauthorized access to student outside your assigned section.');
    }
  }
}
