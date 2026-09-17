<?php

namespace App\Http\Controllers\Web;

use App\Enums\UserRoles;
use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\StudentOjt;
use App\Models\User;
use App\Traits\ScopesForInstructor;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AttendanceController extends Controller {
  use ScopesForInstructor;

  public function index(Request $request): View {
    $user = Auth::user();

    $query = Attendance::query()
      ->with([
        'student',
        'ojt.office',
        'ojt.supervisor',
      ]);

    if ($user->role === UserRoles::SUPERVISOR || $user->role->value === 'supervisor') {
      $query->whereHas('ojt', function ($q) use ($user) {
        $q->where('supervisor_id', $user->id);
      });
    }

    if ($request->filled('student_id')) {
      $query->where('student_id', $request->input('student_id'));
    }

    if ($request->filled('date')) {
      $query->whereDate('date', $request->input('date'));
    }

    $attendances = $this->applyInstructorSectionScope($query, null, 'student')
      ->orderBy('date', 'desc')
      ->paginate(10)
      ->withQueryString();

    $studentsQuery = User::query()
      ->where('role', UserRoles::STUDENT->value)
      ->orderBy('last_name');
    $students = $this->applyInstructorSectionScope($studentsQuery, null, 'self')->get();

    return view("shared.attendance.index", compact("attendances", "students"));
  }

  public function show(Attendance $attendance): View {
    $this->authorizeInstructorStudentAccess($attendance->student);
    $attendance->load([
      'student',
      'ojt.office',
      'ojt.supervisor',
    ]);

    return view("shared.attendance.show", compact("attendance"));
  }

  public function create(): View {
    $studentsQuery = User::query()
      ->where('role', UserRoles::STUDENT->value)
      ->orderBy('last_name');
    $students = $this->applyInstructorSectionScope($studentsQuery, null, 'self')->get();

    $studentOjtsQuery = StudentOjt::query()
      ->with(['student', 'office', 'supervisor'])
      ->latest();
    $studentOjts = $this->applyInstructorSectionScope($studentOjtsQuery, null, 'student')->get();

    return view("shared.attendance.create", compact("students", "studentOjts"));
  }

  public function store(Request $request) {
    $validated = $request->validate([
      'student_id' => ['required', 'exists:users,id'],
      'ojt_id' => ['required', 'exists:student_ojts,id'],
      'date' => ['required', 'date'],
      'morning_in' => ['nullable'],
      'morning_in_verified' => ['nullable', 'boolean'],
      'morning_out' => ['nullable'],
      'morning_out_verified' => ['nullable', 'boolean'],
      'afternoon_in' => ['nullable'],
      'afternoon_in_verified' => ['nullable', 'boolean'],
      'afternoon_out' => ['nullable'],
      'afternoon_out_verified' => ['nullable', 'boolean'],
    ]);

    $student = User::find($validated['student_id']);
    $this->authorizeInstructorStudentAccess($student);

    if (\Carbon\Carbon::parse($validated['date'])->isWeekend()) {
      return back()
        ->withInput()
        ->withErrors(['date' => 'Attendance can only be recorded on weekdays (Monday to Friday).']);
    }

    $validated['morning_in_verified'] = $request->boolean('morning_in_verified');
    $validated['morning_out_verified'] = $request->boolean('morning_out_verified');
    $validated['afternoon_in_verified'] = $request->boolean('afternoon_in_verified');
    $validated['afternoon_out_verified'] = $request->boolean('afternoon_out_verified');

    Attendance::create($validated);

    $role = Auth::user()->role->value;

    return redirect()
      ->route("web.{$role}.attendance.index")
      ->with("success", "Attendance logged successfully.");
  }

  public function edit(Attendance $attendance): View {
    $this->authorizeInstructorStudentAccess($attendance->student);

    $studentsQuery = User::query()
      ->where('role', UserRoles::STUDENT->value)
      ->orderBy('last_name');
    $students = $this->applyInstructorSectionScope($studentsQuery, null, 'self')->get();

    $studentOjtsQuery = StudentOjt::query()
      ->with(['student', 'office', 'supervisor'])
      ->latest();
    $studentOjts = $this->applyInstructorSectionScope($studentOjtsQuery, null, 'student')->get();

    return view("shared.attendance.edit", compact("attendance", "students", "studentOjts"));
  }

  public function update(Request $request, Attendance $attendance) {
    $this->authorizeInstructorStudentAccess($attendance->student);

    $validated = $request->validate([
      'student_id' => ['required', 'exists:users,id'],
      'ojt_id' => ['required', 'exists:student_ojts,id'],
      'date' => ['required', 'date'],
      'morning_in' => ['nullable'],
      'morning_in_verified' => ['nullable', 'boolean'],
      'morning_out' => ['nullable'],
      'morning_out_verified' => ['nullable', 'boolean'],
      'afternoon_in' => ['nullable'],
      'afternoon_in_verified' => ['nullable', 'boolean'],
      'afternoon_out' => ['nullable'],
      'afternoon_out_verified' => ['nullable', 'boolean'],
    ]);

    if (\Carbon\Carbon::parse($validated['date'])->isWeekend()) {
      return back()
        ->withInput()
        ->withErrors(['date' => 'Attendance can only be recorded on weekdays (Monday to Friday).']);
    }

    $validated['morning_in_verified'] = $request->boolean('morning_in_verified');
    $validated['morning_out_verified'] = $request->boolean('morning_out_verified');
    $validated['afternoon_in_verified'] = $request->boolean('afternoon_in_verified');
    $validated['afternoon_out_verified'] = $request->boolean('afternoon_out_verified');

    $attendance->update($validated);

    $role = Auth::user()->role->value;

    return redirect()
      ->route("web.{$role}.attendance.index")
      ->with("success", "Attendance record updated successfully.");
  }

  public function toggleApproval(Request $request, Attendance $attendance) {
    $this->authorizeInstructorStudentAccess($attendance->student);

    $currentlyApproved = $attendance->is_fully_approved;
    $newStatus = !$currentlyApproved;

    $attendance->morning_in_verified = $newStatus;
    $attendance->morning_out_verified = $newStatus;
    $attendance->afternoon_in_verified = $newStatus;
    $attendance->afternoon_out_verified = $newStatus;

    $attendance->save();

    $statusMsg = $newStatus ? 'approved' : 'unapproved';
    $dateStr = $attendance->date ? $attendance->date->format('M d, Y') : 'selected date';

    return back()->with('success', "All 4 attendance slots for {$dateStr} marked as {$statusMsg}.");
  }

  public function toggleSlot(Request $request, Attendance $attendance, string $slot) {
    $this->authorizeInstructorStudentAccess($attendance->student);

    $validSlots = [
      'morning_in' => 'morning_in_verified',
      'morning_out' => 'morning_out_verified',
      'afternoon_in' => 'afternoon_in_verified',
      'afternoon_out' => 'afternoon_out_verified',
    ];

    if (!array_key_exists($slot, $validSlots)) {
      return back()->with('error', 'Invalid attendance slot.');
    }

    if (!$attendance->{$slot}) {
      return back()->with('error', 'Cannot toggle approval for a slot without a logged time.');
    }

    $field = $validSlots[$slot];
    $attendance->{$field} = !$attendance->{$field};
    $attendance->save();

    $state = $attendance->{$field} ? 'approved' : 'unapproved';
    $label = str_replace('_', ' ', $slot);

    return back()->with('success', "Slot '{$label}' marked as {$state}.");
  }

  public function destroy(Attendance $attendance) {
    $this->authorizeInstructorStudentAccess($attendance->student);
    $attendance->delete();

    $role = Auth::user()->role->value;

    return redirect()
      ->route("web.{$role}.attendance.index")
      ->with("success", "Attendance record deleted successfully.");
  }
}
