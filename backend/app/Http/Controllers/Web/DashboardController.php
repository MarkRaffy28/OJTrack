<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Enums\OjtStatus;
use App\Models\Attendance;
use App\Models\Office;
use App\Models\Report;
use App\Models\StudentOjt;
use App\Models\User;
use App\Traits\ScopesForInstructor;
use App\Services\TimeService;
use Carbon\Carbon;

class DashboardController extends Controller {
  use ScopesForInstructor;

  public function index() {
    $today = Carbon::now(TimeService::TIMEZONE)->toDateString();
    $yesterday = Carbon::now(TimeService::TIMEZONE)->subDay()->toDateString();
    $totalStudents = $this->applyInstructorSectionScope(
      User::query()->where('role', 'student')->where('status', 'active'),
      null,
      'self',
    )->count();
    $totalStudentsLastWeek = $this->applyInstructorSectionScope(
      User::query()->where('role', 'student')->where('status', 'active')->where("created_at", "<=", now()->subWeek()),
      null,
      'self'
    )->count();

    $totalUsers = User::count();
    $totalUsersLastWeek = User::where('created_at', '<=', now()->subWeek())->count();

    $activeOjtQuery = StudentOjt::where(function ($query) use ($today) {
      $query->where(function ($dates) use ($today) {
        $dates->whereDate("start_date", "<=", $today)
          ->whereDate("end_date", ">=", $today);
      })->orWhereHas('attendances', fn($attendance) => $attendance->whereDate('date', $today));
    });
    $activeOjtIds = $this->applyInstructorSectionScope($activeOjtQuery, null, 'student')->pluck("id");

    $todaysAttendanceQuery = Attendance::whereDate("date", $today)
      ->whereIn("ojt_id", $activeOjtIds)
      ->with("ojt.office");
    $todaysAttendance = $this->applyInstructorSectionScope($todaysAttendanceQuery, null, 'student')->get();

    $yesterdaysAttendanceQuery = Attendance::whereDate("date", $yesterday)
      ->whereIn("ojt_id", $activeOjtIds);
    $yesterdaysAttendance = $this->applyInstructorSectionScope($yesterdaysAttendanceQuery, null, 'student')->get();

    $totalActiveStudentsQuery = StudentOjt::whereIn("id", $activeOjtIds);
    $totalActiveStudents = $this->applyInstructorSectionScope($totalActiveStudentsQuery, null, 'student')
      ->distinct("student_id")
      ->count("student_id");

    $presentToday = $todaysAttendance->filter(fn(Attendance $attendance) => $attendance->morning_in || $attendance->afternoon_in)->unique("student_id")->count();
    $presentYesterday = $yesterdaysAttendance->filter(fn(Attendance $attendance) => $attendance->morning_in || $attendance->afternoon_in)->unique("student_id")->count();

    $absentToday = max($totalActiveStudents - $presentToday, 0);
    $absentYesterday = max($totalActiveStudents - $presentYesterday, 0);

    $lateToday = $this->countLate($todaysAttendance);
    $lateYesterday = $this->countLate($yesterdaysAttendance->load("ojt.office"));

    $reportsThisWeekQuery = Report::whereBetween("report_date", [now()->startOfWeek(), now()->endOfWeek()]);
    $reportsThisWeek = $this->applyInstructorSectionScope($reportsThisWeekQuery, null, 'student')->count();

    $reportsLastWeekQuery = Report::whereBetween("report_date", [
      now()->subWeek()->startOfWeek(),
      now()->subWeek()->endOfWeek(),
    ]);
    $reportsLastWeek = $this->applyInstructorSectionScope($reportsLastWeekQuery, null, 'student')->count();

    $stats = [
      [
        "label" => "Total Users",
        "value" => $totalUsers,
        "change" => $this->percentChange($totalUsers, $totalUsersLastWeek),
        "note" => "vs. last week",
        "icon" => "people",
        "color" => "primary",
        "route" => "users.index",
      ],
      [
        "label" => "Total Students",
        "value" => $totalStudents,
        "change" => $this->percentChange($totalStudents, $totalStudentsLastWeek),
        "note" => "vs. last week",
        "icon" => "group",
        "color" => "info",
        "route" => "users.index",
      ],
      [
        "label" => "Present Today",
        "value" => $presentToday,
        "change" => $this->percentChange($presentToday, $presentYesterday),
        "note" => "vs. yesterday",
        "icon" => "check_circle",
        "color" => "success",
        "route" => "attendance.present",
      ],
      [
        "label" => "Absent",
        "value" => $absentToday,
        "change" => $this->percentChange($absentToday, $absentYesterday),
        "note" => "vs. yesterday",
        "icon" => "cancel",
        "color" => "danger",
        "route" => "attendance.absent",
      ],
      [
        "label" => "Late",
        "value" => $lateToday,
        "change" => $this->percentChange($lateToday, $lateYesterday),
        "note" => "vs. yesterday",
        "icon" => "schedule",
        "color" => "warning",
        "route" => "attendance.late",
      ],
      [
        "label" => "Reports",
        "value" => $reportsThisWeek,
        "change" => $this->percentChange($reportsThisWeek, $reportsLastWeek),
        "note" => "vs. last week",
        "icon" => "description",
        "color" => "primary",
        "route" => "reports.index",
      ],
    ];

    $completedHoursQuery = StudentOjt::whereIn("id", $activeOjtIds)->with("attendances");
    $completedHours = $this->applyInstructorSectionScope($completedHoursQuery, null, 'student')
      ->get()
      ->sum(fn(StudentOjt $ojt) => $ojt->rendered_hours);

    $atRiskQuery = StudentOjt::whereIn("id", $activeOjtIds)->with("attendances");
    $atRiskCount = $this->applyInstructorSectionScope($atRiskQuery, null, 'student')
      ->get()
      ->filter(function (StudentOjt $ojt) {
        $totalDays = $ojt->start_date->diffInDays($ojt->end_date) ?: 1;
        $elapsedDays = min($ojt->start_date->diffInDays(today()), $totalDays);
        $expectedPercent = ($elapsedDays / $totalDays) * 100;

        return $ojt->progress_percent < ($expectedPercent - 15);
      })
      ->count();

    $officesCount = Office::count();

    $supervisorsCount = User::where("role", "supervisor")->count();
    $instructorsCount = User::where("role", "instructor")->count();

    $recentReportsQuery = Report::with("student")->latest("report_date");
    $recentReports = $this->applyInstructorSectionScope($recentReportsQuery, null, 'student')->take(4)->get();

    return view("shared.dashboard.index", compact(
      "stats",
      "completedHours",
      "atRiskCount",
      "officesCount",
      "supervisorsCount",
      "instructorsCount",
      "recentReports"
    ));
  }

  public function present() {
    return $this->attendanceStatusPage('present');
  }

  public function absent() {
    return $this->attendanceStatusPage('absent');
  }

  public function late() {
    return $this->attendanceStatusPage('late');
  }

  public function completed() {
    $students = $this->applyInstructorSectionScope(
      StudentOjt::query()->where('status', OjtStatus::COMPLETED->value)
        ->with(['student', 'supervisor', 'office', 'attendances']),
      null,
      'student',
    )->latest('end_date')->get();

    return view('shared.dashboard.student-list', [
      'title' => 'Completed OJT Students',
      'description' => 'Students who have completed their OJT placement.',
      'students' => $students,
      'detailLabel' => 'Completed',
      'detailValue' => fn(StudentOjt $ojt) => $ojt->end_date?->format('M d, Y') ?? 'Date not set',
    ]);
  }

  public function atRisk() {
    $students = $this->activeOjtRecords()->filter(function (StudentOjt $ojt) {
      $totalDays = $ojt->start_date->diffInDays($ojt->end_date) ?: 1;
      $elapsedDays = min($ojt->start_date->diffInDays(today()), $totalDays);
      $expectedPercent = ($elapsedDays / $totalDays) * 100;

      return $ojt->progress_percent < ($expectedPercent - 15);
    })->values();

    return view('shared.dashboard.student-list', [
      'title' => 'Students at Risk',
      'description' => 'Active students whose approved progress is significantly behind schedule.',
      'students' => $students,
      'detailLabel' => 'Progress',
      'detailValue' => fn(StudentOjt $ojt) => number_format($ojt->progress_percent, 1) . '% complete',
    ]);
  }

  private function attendanceStatusPage(string $status) {
    $activeOjts = $this->activeOjtRecords();
    $today = Carbon::now(TimeService::TIMEZONE)->startOfDay();

    $students = $activeOjts->filter(function (StudentOjt $ojt) use ($status, $today) {
      $attendance = $ojt->attendances->first(fn(Attendance $attendance) => $attendance->date?->isSameDay($today));
      $isPresent = $attendance && ($attendance->morning_in || $attendance->afternoon_in);
      $isLate = $isPresent && $this->isLateAttendance($attendance);

      return match ($status) {
        'present' => $isPresent,
        'absent' => !$isPresent,
        'late' => $isLate,
      };
    })->values();

    return view('shared.dashboard.student-list', [
      'title' => ucfirst($status) . ' Students',
      'description' => "Active students marked {$status} today.",
      'students' => $students,
      'detailLabel' => $status === 'late' ? 'Arrival' : 'Attendance',
      'detailValue' => function (StudentOjt $ojt) use ($status, $today) {
        $attendance = $ojt->attendances->first(fn(Attendance $attendance) => $attendance->date?->isSameDay($today));
        if ($status === 'absent') return 'No check-in recorded';
        if ($status === 'late') return 'Checked in at ' . Carbon::parse($attendance->morning_in)->format('g:i A');
        return 'Checked in at ' . Carbon::parse($attendance->morning_in)->format('g:i A');
      },
    ]);
  }

  private function activeOjtRecords() {
    $today = Carbon::now(TimeService::TIMEZONE)->toDateString();
    $query = StudentOjt::query()
      ->where(function ($query) use ($today) {
        $query->where(function ($dates) use ($today) {
          $dates->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today);
        })->orWhereHas('attendances', fn($attendance) => $attendance->whereDate('date', $today));
      })
      ->with(['student', 'supervisor', 'office', 'attendances']);

    return $this->applyInstructorSectionScope($query, null, 'student')->get();
  }

  private function countLate($attendances): int {
    return $attendances->filter(fn(Attendance $attendance) => $this->isLateAttendance($attendance))->count();
  }

  private function isLateAttendance(Attendance $attendance): bool {
      $office = $attendance->ojt->office ?? null;

      if (!$office || !$attendance->morning_in || !$office->morning_in) {
        return false;
      }

      $scheduledIn = Carbon::parse((string) $office->morning_in);
      $actualIn = Carbon::parse((string) $attendance->morning_in);

      return $actualIn->greaterThan($scheduledIn);
  }

  private function percentChange(int $current, int $previous): array {
    if ($previous === 0) {
      return ["value" => $current > 0 ? "+100%" : "0%", "trend" => $current >= 0 ? "up" : "down"];
    }

    $diff = round((($current - $previous) / $previous) * 100);

    return [
      "value" => ($diff >= 0 ? "+" : "") . $diff . "%",
      "trend" => $diff >= 0 ? "up" : "down",
    ];
  }
}
