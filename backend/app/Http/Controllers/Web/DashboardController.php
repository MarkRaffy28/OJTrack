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

class DashboardController extends Controller {

  public function index() {
    $now = Carbon::now(TimeService::TIMEZONE);
    $today = $now->toDateString();
    $yesterday = $now->copy()->subDay()->toDateString();
    $viewer = Auth::user();

    $totalStudents = User::query()
      ->where('role', 'student')
      ->where('status', 'active')
      ->visibleTo($viewer)
      ->count();
    $totalStudentsLastWeek = User::query()
      ->where('role', 'student')
      ->where('status', 'active')
      ->where("created_at", "<=", now()->subWeek())
      ->visibleTo($viewer)
      ->count();

    $totalUsers = User::count();
    $totalUsersLastWeek = User::where('created_at', '<=', now()->subWeek())->count();

    $activeOjtIds = $this->activeOjtQuery($today)
      ->whereHas('student', fn($q) => $q->visibleTo($viewer))
      ->pluck("id");

    $todaysAttendance = $this->attendanceOn($today, $activeOjtIds, $viewer)
      ->with("ojt.office")
      ->get();
    $yesterdaysAttendance = $this->attendanceOn($yesterday, $activeOjtIds, $viewer)
      ->with("ojt.office")
      ->get();

    $totalActiveStudents = StudentOjt::whereIn("id", $activeOjtIds)
      ->whereHas('student', fn($q) => $q->visibleTo($viewer))
      ->distinct("student_id")
      ->count("student_id");

    $presentToday = $this->countPresent($todaysAttendance);
    $presentYesterday = $this->countPresent($yesterdaysAttendance);

    $absentToday = max($totalActiveStudents - $presentToday, 0);
    $absentYesterday = max($totalActiveStudents - $presentYesterday, 0);

    $lateToday = $this->countLate($todaysAttendance);
    $lateYesterday = $this->countLate($yesterdaysAttendance);

    $reportsThisWeek = $this->countReportsBetween($viewer, now()->startOfWeek(), now()->endOfWeek());
    $reportsLastWeek = $this->countReportsBetween($viewer, now()->subWeek()->startOfWeek(), now()->subWeek()->endOfWeek());

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

    $activeOjts = StudentOjt::whereIn("id", $activeOjtIds)
      ->with(["attendances", "ojt"])
      ->whereHas('student', fn($q) => $q->visibleTo($viewer))
      ->get();

    $completedHours = $activeOjts->sum(fn(StudentOjt $ojt) => $ojt->rendered_hours);
    $atRiskCount = $activeOjts->filter(fn(StudentOjt $ojt) => $this->isAtRisk($ojt))->count();

    $officesCount = Office::count();
    $supervisorsCount = User::where("role", "supervisor")->count();
    $instructorsCount = User::where("role", "instructor")->count();

    $recentReports = Report::with("student")
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
    $viewer = Auth::user();

    $students = StudentOjt::query()
      ->where('status', OjtStatus::COMPLETED->value)
      ->with(['student', 'supervisor', 'office', 'attendances'])
      ->whereHas('student', fn($q) => $q->visibleTo($viewer))
      ->latest('end_date')
      ->get();

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

  private function attendanceStatusPage(string $status) {
    $today = Carbon::now(TimeService::TIMEZONE)->startOfDay();
    $todaysAttendance = fn(StudentOjt $ojt) => $ojt->attendances
      ->first(fn(Attendance $attendance) => $attendance->date?->isSameDay($today));

    $students = $this->activeOjtRecords()->filter(function (StudentOjt $ojt) use ($status, $todaysAttendance) {
      $attendance = $todaysAttendance($ojt);
      $isPresent = $attendance && $this->isPresent($attendance);

      return match ($status) {
        'present' => $isPresent,
        'absent' => !$isPresent,
        'late' => $isPresent && $this->isLateAttendance($attendance),
      };
    })->values();

    return view('shared.dashboard.student-list', [
      'title' => ucfirst($status) . ' Students',
      'description' => "Active students marked {$status} today.",
      'students' => $students,
      'detailLabel' => $status === 'late' ? 'Arrival' : 'Attendance',
      'detailValue' => function (StudentOjt $ojt) use ($status, $todaysAttendance) {
        if ($status === 'absent') return 'No check-in recorded';

        return 'Checked in at ' . Carbon::parse($todaysAttendance($ojt)->morning_in)->format('g:i A');
      },
    ]);
  }

  // Active = OJT period covers today, or the student has attendance today.
  private function activeOjtQuery(string $today) {
    return StudentOjt::where(function ($query) use ($today) {
      $query->whereHas('ojt', function ($dates) use ($today) {
        $dates->whereDate('start_date', '<=', $today)
          ->whereDate('end_date', '>=', $today);
      })->orWhereHas('attendances', fn($attendance) => $attendance->whereDate('date', $today));
    });
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
    return Attendance::whereDate("date", $date)
      ->whereIn("ojt_id", $activeOjtIds)
      ->whereHas('student', fn($q) => $q->visibleTo($viewer));
  }

  private function countReportsBetween($viewer, $from, $to): int {
    return Report::whereBetween("report_date", [$from, $to])
      ->whereHas('student', fn($q) => $q->visibleTo($viewer))
      ->count();
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