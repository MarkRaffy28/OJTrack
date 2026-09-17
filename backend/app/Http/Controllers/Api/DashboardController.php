<?php

namespace App\Http\Controllers\Api;

use App\Enums\OjtStatus;
use App\Enums\ReportStatus;
use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Report;
use App\Models\Setting;
use App\Models\StudentOjt;
use App\Services\TimeService;
use App\Utils\ProfilePictureUtil;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller {
  /**
   * Return dashboard overview metrics for authenticated student user.
   */
  public function student(Request $request): JsonResponse {
    $user = $request->user();

    // 1. Student Info
    $studentData = [
      'name' => $user->full_name,
      'profilePicture' => ProfilePictureUtil::toBase64($user->profile_picture),
    ];

    // 2. OJT Details
    $ojt = StudentOjt::with('office')
      ->where('student_id', $user->id)
      ->where('status', OjtStatus::ONGOING)
      ->latest()
      ->first();

    if (!$ojt) {
      $ojt = StudentOjt::with('office')
        ->where('student_id', $user->id)
        ->latest()
        ->first();
    }

    $ojtData = null;
    if ($ojt) {
      // Older OJT records may have been created before required hours were
      // copied from settings. Use the current setting for those records so
      // the dashboard does not render a meaningless 0/0 overview.
      $requiredHours = (float) $ojt->required_hours;
      if ($requiredHours <= 0) {
        $requiredHours = (float) Setting::get('required_hours', 0);
      }
      // Derive completed hours from attendance records so the dashboard stays
      // consistent with the attendance history, even when the cached OJT
      // rendered-hours value is stale.
      $completedHours = round(
        Attendance::where('student_id', $user->id)
          ->get()
          ->sum(fn (Attendance $attendance) => $this->calculateAttendanceHours($attendance)),
        2
      );
      $completedHours = max(0.0, $completedHours);
      $remainingHours = max(0.0, round($requiredHours - $completedHours, 2));
      $progress = $requiredHours > 0
        ? min(1.0, max(0.0, round($completedHours / $requiredHours, 4)))
        : 0.0;
      $ojtData = [
        'status' => $ojt->status?->value ?? $ojt->status,
        'officeName' => $ojt->office ? $ojt->office->name : '',
        'requiredHours' => $requiredHours,
        'completedHours' => $completedHours,
        'remainingHours' => $remainingHours,
        'progress' => $progress,
      ];
    }

    // 3. Today's Attendance
    $today = Carbon::now(TimeService::TIMEZONE)->toDateString();
    $todayAttendance = Attendance::where('student_id', $user->id)
      ->where('date', $today)
      ->first();

    $totalHours = $todayAttendance
      ? $this->calculateAttendanceHours($todayAttendance)
      : 0.0;

    $attendanceData = [
      'morningIn' => $todayAttendance?->morning_in?->format('H:i'),
      'morningOut' => $todayAttendance?->morning_out?->format('H:i'),
      'afternoonIn' => $todayAttendance?->afternoon_in?->format('H:i'),
      'afternoonOut' => $todayAttendance?->afternoon_out?->format('H:i'),
      'totalHours' => $totalHours,
    ];

    // 4. Report Statistics
    $reportsQuery = Report::where('student_id', $user->id);

    $reportsData = [
      'pending' => (clone $reportsQuery)->where('status', ReportStatus::PENDING)->count(),
      'submitted' => (clone $reportsQuery)->count(),
      'approved' => (clone $reportsQuery)->where('status', ReportStatus::APPROVED)->count(),
      'rejected' => (clone $reportsQuery)->where('status', ReportStatus::REJECTED)->count(),
    ];

    return response()->json([
      'student' => $studentData,
      'ojt' => $ojtData,
      'attendance' => $attendanceData,
      'reports' => $reportsData,
    ]);
  }

  /**
   * Return dashboard overview metrics for authenticated supervisor user.
   */
  public function supervisor(Request $request): JsonResponse {
    $user = $request->user();
    $user->load('supervisorDetail.office');

    $officeName = $user->supervisorDetail?->office?->name ?? 'Unassigned Office';

    $supervisorData = [
      'name' => $user->full_name,
      'position' => $user->supervisorDetail?->position ?? 'Supervisor',
      'officeName' => $officeName,
      'profilePicture' => ProfilePictureUtil::toBase64($user->profile_picture),
    ];

    // Trainees under supervisor
    $ojts = StudentOjt::with(['student'])
      ->where('supervisor_id', $user->id)
      ->get();

    $totalTrainees = $ojts->count();
    $activeTrainees = $ojts->where('status', OjtStatus::ONGOING)->count();
    $totalRenderedHours = round($ojts->sum('rendered_hours'), 2);

    // Today's attendance stats
    $today = Carbon::now(TimeService::TIMEZONE)->toDateString();
    $todayAttendances = Attendance::whereIn('ojt_id', $ojts->pluck('id'))
      ->where('date', $today)
      ->get();

    $presentTodayCount = $todayAttendances->filter(function ($att) {
      return $att->morning_in || $att->afternoon_in;
    })->count();

    // Pending reports
    $pendingReportsCount = Report::whereIn('ojt_id', $ojts->pluck('id'))
      ->where('status', ReportStatus::PENDING)
      ->count();

    return response()->json([
      'supervisor' => $supervisorData,
      'stats' => [
        'totalTrainees' => $totalTrainees,
        'activeTrainees' => $activeTrainees,
        'presentToday' => $presentTodayCount,
        'pendingReports' => $pendingReportsCount,
        'totalRenderedHours' => $totalRenderedHours,
      ],
    ]);
  }

  private function calculateAttendanceHours(Attendance $attendance): float {
    $totalMinutes = 0;

    foreach ([
      ['morning_in', 'morning_out'],
      ['afternoon_in', 'afternoon_out'],
    ] as [$inField, $outField]) {
      $timeIn = $attendance->{$inField};
      $timeOut = $attendance->{$outField};

      if (!$timeIn || !$timeOut) {
        continue;
      }

      $in = Carbon::parse((string) $timeIn, TimeService::TIMEZONE);
      $out = Carbon::parse((string) $timeOut, TimeService::TIMEZONE);
      $totalMinutes += max(0, $in->diffInMinutes($out, false));
    }

    return round($totalMinutes / 60, 2);
  }
}
