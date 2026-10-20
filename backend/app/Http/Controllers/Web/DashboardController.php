<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Enums\OjtStatus;
use App\Models\Attendance;
use App\Models\Office;
use App\Models\Report;
use App\Models\StudentOjt;
use App\Models\User;
use App\Services\TimeService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller {

  public function index() {
    $now = Carbon::now(TimeService::TIMEZONE);
    $today = $now->toDateString();
    $viewer = Auth::user();

    $totalStudents = User::query()
      ->where('role', 'student')
      ->where('status', 'active')
      ->whereHas('studentOjts', fn($q) => $this->selectedCohortQuery($q))
      ->visibleTo($viewer)
      ->count();
    $totalUsers = User::count();

    $activeOjtIds = $this->activeOjtQuery($today)
      ->whereHas('student', fn($q) => $q->visibleTo($viewer))
      ->pluck("id");

    $todaysAttendance = $this->attendanceOn($today, $activeOjtIds, $viewer)->get();

    $totalActiveStudents = StudentOjt::whereIn("id", $activeOjtIds)
      ->whereHas('student', fn($q) => $q->visibleTo($viewer))
      ->distinct("student_id")
      ->count("student_id");

    $presentToday = $this->countPresent($todaysAttendance);
    $absentToday = max($totalActiveStudents - $presentToday, 0);
    $lateToday = $this->countLate($todaysAttendance);

    $todayDateRange = "{$today} to {$today}";
    $attendanceTodayQuery = [
      "all_offices" => 1,
      "all_sections" => 1,
      "all_reports" => 1,
      "date_range" => $todayDateRange,
    ];

    $stats = [
      [
        "label" => "Total Users",
        "value" => $totalUsers,
        "icon" => "people",
        "color" => "primary",
        "route" => "users.index",
      ],
      [
        "label" => "Total Students",
        "value" => $totalStudents,
        "icon" => "group",
        "color" => "info",
        "route" => "users.index",
      ],
      [
        "label" => "Present Today",
        "value" => $presentToday,
        "icon" => "check_circle",
        "color" => "success",
        "route" => "attendance.index",
        "query" => $attendanceTodayQuery,
      ],
      [
        "label" => "Absent",
        "value" => $absentToday,
        "icon" => "cancel",
        "color" => "danger",
        "route" => "student-ojts.absent",
      ],
      [
        "label" => "Late",
        "value" => $lateToday,
        "icon" => "schedule",
        "color" => "warning",
        "route" => "attendance.index",
        "query" => $attendanceTodayQuery,
      ],
      [
        "label" => "Reports",
        "value" => Report::query()
          ->whereDate("report_date", $today)
          ->tap(fn($q) => $this->selectedCohortQuery($q, 'ojt.ojt'))
          ->whereHas('student', fn($q) => $q->visibleTo($viewer))
          ->count(),
        "icon" => "description",
        "color" => "primary",
        "route" => "reports.index",
        "query" => $attendanceTodayQuery,
      ],
    ];

    $activeOjts = StudentOjt::whereIn("id", $activeOjtIds)
      ->without(['student', 'office'])
      ->with('ojt')
      ->select('student_ojts.*')
      ->selectSub($this->approvedHoursSubquery(), 'rendered_hours')
      ->whereHas('student', fn($q) => $q->visibleTo($viewer))
      ->get();

    $completedHours = $activeOjts->sum(fn(StudentOjt $ojt) => $ojt->rendered_hours);
    $atRiskCount = $activeOjts->filter(fn(StudentOjt $ojt) => $this->isAtRisk($ojt))->count();

    $officesCount = Office::count();
    $supervisorsCount = User::where("role", "supervisor")->count();
    $instructorsCount = User::where("role", "instructor")->count();

    $recentReports = Report::query()
      ->without(['ojt', 'reviewer'])
      ->with("student")
      ->tap(fn($q) => $this->selectedCohortQuery($q, 'ojt.ojt'))
      ->whereHas('student', fn($q) => $q->visibleTo($viewer))
      ->latest("report_date")
      ->take(4)
      ->get();

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

  public function completed() {
    $viewer = Auth::user();

    $students = StudentOjt::query()
      ->tap(fn($q) => $this->selectedCohortQuery($q))
      ->where('status', OjtStatus::COMPLETED->value)
      ->with(['student', 'supervisor', 'office', 'attendances'])
      ->whereHas('student', fn($q) => $q->visibleTo($viewer))
      ->get()
      ->sortByDesc(fn(StudentOjt $ojt) => $ojt->end_date)
      ->values();

    return view('shared.dashboard.student-list', [
      'title' => 'Completed OJT Students',
      'description' => 'Students who have completed their OJT placement.',
      'students' => $students,
      'detailLabel' => 'Completed',
      'detailValue' => fn(StudentOjt $ojt) => $ojt->end_date?->format('M d, Y') ?? 'Date not set',
    ]);
  }

  public function atRisk() {
    $students = $this->activeOjtRecords()
      ->filter(fn(StudentOjt $ojt) => $this->isAtRisk($ojt))
      ->values();

    return view('shared.dashboard.student-list', [
      'title' => 'Students at Risk',
      'description' => 'Students whose current OJT progress is more than 15 percentage points below their expected progress, calculated from the proportion of the OJT period that has elapsed.',
      'students' => $students,
      'detailLabel' => 'Progress',
      'detailValue' => fn(StudentOjt $ojt) => number_format($ojt->progress_percent, 1) . '% complete',
    ]);
  }

  public function absent() {
    $today = Carbon::now(TimeService::TIMEZONE)->toDateString();

    $students = $this->activeOjtRecords()
      ->filter(function (StudentOjt $ojt) use ($today) {
        return !$ojt->attendances->contains(
          fn(Attendance $attendance) => $attendance->date?->toDateString() === $today
            && $this->isPresent($attendance)
        );
      })
      ->values();

    return view('shared.dashboard.student-list', [
      'title' => 'Absent Students',
      'description' => 'Active students with no attendance check-in recorded today.',
      'students' => $students,
      'detailLabel' => 'Attendance',
      'detailValue' => fn(StudentOjt $ojt) => 'No check-in recorded',
    ]);
  }

  // Active = OJT period covers today, or the student has attendance today.
  private function activeOjtQuery(string $today) {
    return StudentOjt::where(function ($query) use ($today) {
      $query->whereHas('ojt', function ($dates) use ($today) {
        $dates->whereDate('start_date', '<=', $today)
          ->whereDate('end_date', '>=', $today);
      })->orWhereHas('attendances', fn($attendance) => $attendance->whereDate('date', $today));
    })->tap(fn($query) => $this->selectedCohortQuery($query));
  }

  private function activeOjtRecords() {
    $viewer = Auth::user();
    $today = Carbon::now(TimeService::TIMEZONE)->toDateString();

    return $this->activeOjtQuery($today)
      ->with(['student', 'supervisor', 'office', 'attendances', 'ojt'])
      ->whereHas('student', fn($q) => $q->visibleTo($viewer))
      ->get();
  }

  private function attendanceOn(string $date, $activeOjtIds, $viewer) {
    return Attendance::query()
      ->without('student')
      ->with('ojt.office')
      ->select([
        'id',
        'student_id',
        'ojt_id',
        'date',
        'morning_in',
        'afternoon_in',
      ])
      ->whereDate("date", $date)
      ->whereIn("ojt_id", $activeOjtIds)
      ->whereHas('student', fn($q) => $q->visibleTo($viewer));
  }

  private function approvedHoursSubquery() {
    return DB::table('attendance')
      ->selectRaw(<<<'SQL'
        ROUND(COALESCE(SUM(
          CASE
            WHEN morning_in IS NOT NULL
              AND morning_out IS NOT NULL
              AND morning_in_verified = 1
              AND morning_out_verified = 1
            THEN ROUND(GREATEST(0, TIME_TO_SEC(TIMEDIFF(morning_out, morning_in)) / 3600), 2)
            ELSE 0
          END
          + CASE
            WHEN afternoon_in IS NOT NULL
              AND afternoon_out IS NOT NULL
              AND afternoon_in_verified = 1
              AND afternoon_out_verified = 1
            THEN ROUND(GREATEST(0, TIME_TO_SEC(TIMEDIFF(afternoon_out, afternoon_in)) / 3600), 2)
            ELSE 0
          END
        ), 0), 2)
      SQL)
      ->whereColumn('attendance.ojt_id', 'student_ojts.id');
  }

  private function isPresent(Attendance $attendance): bool {
    return (bool) ($attendance->morning_in || $attendance->afternoon_in);
  }

  private function countPresent($attendances): int {
    return $attendances
      ->filter(fn(Attendance $attendance) => $this->isPresent($attendance))
      ->unique("student_id")
      ->count();
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

  private function isAtRisk(StudentOjt $ojt): bool {
    if (!$ojt->start_date || !$ojt->end_date) return false;

    $totalDays = Carbon::parse($ojt->start_date)->diffInDays(Carbon::parse($ojt->end_date)) ?: 1;
    $elapsedDays = min(Carbon::parse($ojt->start_date)->diffInDays(today()), $totalDays);
    $expectedPercent = ($elapsedDays / $totalDays) * 100;

    return $ojt->progress_percent < ($expectedPercent - 15);
  }

}
