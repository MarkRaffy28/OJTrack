<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Enums\OjtStatus;
use App\Models\StudentOjt;
use App\Traits\ScopesForInstructor;
use Illuminate\Contracts\View\View;

class StudentOjtController extends Controller {
  use ScopesForInstructor;

  public function index(): View {
    $scopedQuery = $this->applyInstructorSectionScope(StudentOjt::query(), null, 'student');
    $allStudentOjts = (clone $scopedQuery)->with('attendances')->get();

    $stats = [
      'total' => $allStudentOjts->count(),
      'ongoing' => $allStudentOjts->where('status', OjtStatus::ONGOING)->count(),
      'completed' => $allStudentOjts->where('status', OjtStatus::COMPLETED)->count(),
      'pending' => $allStudentOjts->where('status', OjtStatus::PENDING)->count(),
      'average_progress' => round($allStudentOjts->avg('progress_percent') ?? 0, 1),
    ];

    $query = StudentOjt::query()
      ->with(['student', 'supervisor', 'office', 'evaluation', 'attendances'])
      ->latest();

    $studentOjts = $this->applyInstructorSectionScope($query, null, 'student')
      ->paginate(10);

    return view("shared.student-ojts.index", compact("studentOjts", "stats"));
  }

  public function show(StudentOjt $studentOjt): View {
    $this->authorizeInstructorStudentAccess($studentOjt->student);
    $studentOjt->load(['student', 'supervisor', 'office', 'attendances', 'evaluation']);

    return view("shared.student-ojts.show", compact("studentOjt"));
  }
}
