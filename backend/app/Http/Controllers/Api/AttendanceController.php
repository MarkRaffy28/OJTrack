<?php

namespace App\Http\Controllers\Api;

use App\Enums\OjtStatus;
use App\Enums\UserRoles;
use App\Http\Controllers\Controller;
use App\Http\Requests\Attendance\ManualAttendanceRequest;
use App\Http\Requests\Attendance\QRAttendanceRequest;
use App\Http\Resources\AttendanceResource;
use App\Models\Attendance;
use App\Models\StudentOjt;
use App\Models\User;
use App\Services\QrCodeTokenService;
use App\Services\TimeService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AttendanceController extends Controller {
  protected TimeService $timeService;

  public function __construct(TimeService $timeService) {
    $this->timeService = $timeService;
  }

  /**
   * Helper to derive the latest ongoing OJT record for the student.
   */
  protected function getOngoingOjt(User $user): StudentOjt {
    $ojt = StudentOjt::where('student_id', $user->id)
      ->where('status', OjtStatus::ONGOING)
      ->latest()
      ->first();

    if (!$ojt) {
      $ojt = StudentOjt::where('student_id', $user->id)
        ->latest()
        ->first();
    }

    if (!$ojt) {
      throw ValidationException::withMessages([
        'ojt' => ['Student is not assigned to any OJT record.'],
      ]);
    }

    return $ojt;
  }

  /**
   * Get today's attendance record for authenticated user.
   */
  public function today(Request $request): JsonResponse {
    $now = Carbon::now(TimeService::TIMEZONE);
    if ($now->isWeekend()) {
      return response()->json([
        'message' => 'Attendance is only available on weekdays (Monday to Friday).',
      ], 400);
    }

    $user = $request->user();
    $ojt = $this->getOngoingOjt($user);

    $today = $now->toDateString();

    $attendance = Attendance::firstOrCreate(
      [
        'student_id' => $user->id,
        'date' => $today,
      ],
      [
        'ojt_id' => $ojt->id,
        'morning_in' => null,
        'morning_in_verified' => false,
        'morning_out' => null,
        'morning_out_verified' => false,
        'afternoon_in' => null,
        'afternoon_in_verified' => false,
        'afternoon_out' => null,
        'afternoon_out_verified' => false,
      ]
    );

    $attendance->load(['ojt.student', 'ojt.supervisor.supervisorDetail', 'ojt.office']);

    return response()->json(
      AttendanceResource::make($attendance)
    );
  }

  /**
   * Submit or update manual attendance for today (ignores payload body, derives OJT automatically).
   */
  public function submitManual(ManualAttendanceRequest $request): JsonResponse {
    $user = $request->user();
    $ojt = $this->getOngoingOjt($user);

    $today = Carbon::now(TimeService::TIMEZONE)->toDateString();

    $attendance = Attendance::firstOrNew([
      'student_id' => $user->id,
      'date' => $today,
    ]);

    $attendance->ojt_id = $ojt->id;

    // Log current timestamp into next available slot via TimeService
    $this->timeService->logNextSlot($attendance);

    $attendance->save();

    $attendance->load(['ojt.student', 'ojt.supervisor.supervisorDetail', 'ojt.office']);

    return response()->json(
      AttendanceResource::make($attendance)
    );
  }

  /**
   * Get list of all attendance records for authenticated user or supervisor's trainees.
   */
  public function index(Request $request): JsonResponse {
    $user = $request->user();

    $query = Attendance::with(['ojt.student', 'ojt.supervisor.supervisorDetail', 'ojt.office']);

    if ($user->role === UserRoles::SUPERVISOR) {
      $studentId = $request->query('student_id');
      $query->whereHas('ojt', function ($q) use ($user) {
        $q->where('supervisor_id', $user->id);
      });
      if ($studentId) {
        $query->where('student_id', $studentId);
      }
    } else {
      $query->where('student_id', $user->id);
    }

    $records = $query->where(function ($q) {
        $q->whereNotNull('morning_in')
          ->orWhereNotNull('morning_out')
          ->orWhereNotNull('afternoon_in')
          ->orWhereNotNull('afternoon_out');
      })
      ->orderBy('date', 'desc')
      ->get();

    return response()->json(
      AttendanceResource::collection($records)
    );
  }

  /**
   * Get specific attendance record by ID.
   */
  public function show(Request $request, int $id): JsonResponse {
    $user = $request->user();

    $query = Attendance::with(['ojt.student', 'ojt.supervisor.supervisorDetail', 'ojt.office'])
      ->where('id', $id);

    if ($user->role === UserRoles::SUPERVISOR) {
      $query->whereHas('ojt', function ($q) use ($user) {
        $q->where('supervisor_id', $user->id);
      });
    } else {
      $query->where('student_id', $user->id);
    }

    $attendance = $query->first();

    if (!$attendance) {
      return response()->json([
        'message' => 'Attendance record not found.',
      ], 404);
    }

    return response()->json(
      AttendanceResource::make($attendance)
    );
  }

  /**
   * Supervisor manual approval of unverified attendance slots.
   */
  public function approve(Request $request, int $id): JsonResponse {
    $user = $request->user();

    if ($user->role !== UserRoles::SUPERVISOR) {
      return response()->json([
        'message' => 'Unauthorized. Only supervisors can approve attendance.',
      ], 403);
    }

    $attendance = Attendance::with(['ojt.student', 'ojt.supervisor.supervisorDetail', 'ojt.office'])
      ->where('id', $id)
      ->whereHas('ojt', function ($q) use ($user) {
        $q->where('supervisor_id', $user->id);
      })
      ->first();

    if (!$attendance) {
      return response()->json([
        'message' => 'Attendance record not found.',
      ], 404);
    }

    $slot = $request->input('slot');
    $validSlots = ['morning_in', 'morning_out', 'afternoon_in', 'afternoon_out'];

    if ($slot && in_array($slot, $validSlots)) {
      if (!$attendance->$slot) {
        return response()->json([
          'message' => 'Cannot toggle approval for a slot without a logged time.',
        ], 400);
      }
      $field = $slot . '_verified';
      $attendance->$field = !$attendance->$field;
    } else {
      $isApproved = $attendance->is_fully_approved;
      $attendance->morning_in_verified = !$isApproved;
      $attendance->morning_out_verified = !$isApproved;
      $attendance->afternoon_in_verified = !$isApproved;
      $attendance->afternoon_out_verified = !$isApproved;
    }

    $attendance->save();

    return response()->json(
      AttendanceResource::make($attendance)
    );
  }

  /**
   * Generate QR token for supervisor's office.
   */
  public function supervisorQr(Request $request, QrCodeTokenService $qrTokenService): JsonResponse {
    $user = $request->user();

    if ($user->role !== UserRoles::SUPERVISOR) {
      return response()->json([
        'message' => 'Unauthorized. Only supervisors can access QR code.',
      ], 403);
    }

    $user->load('supervisorDetail.office');

    $office = $user->supervisorDetail?->office;
    if (!$office) {
      throw ValidationException::withMessages([
        'office' => ['Supervisor is not assigned to any office.'],
      ]);
    }

    $token = $qrTokenService->generate($office->id);

    return response()->json([
      'token' => $token,
      'officeName' => $office->name,
    ]);
  }

  /**
   * Submit QR code attendance for student.
   */
  public function submitQr(
    QRAttendanceRequest $request,
    QrCodeTokenService $qrTokenService
  ): JsonResponse {
    $user = $request->user();

    if ($user->role !== UserRoles::STUDENT) {
      return response()->json([
        'message' => 'Unauthorized. Only students can scan QR code.',
      ], 403);
    }

    $qrPayload = $request->validated()['qrPayload'];

    $parts = explode(':', $qrPayload, 2);
    if (count($parts) !== 2) {
      throw ValidationException::withMessages([
        'qrPayload' => ['Invalid QR code format.'],
      ]);
    }

    $officeId = (int) $parts[0];

    if (!$qrTokenService->verify($officeId, $qrPayload)) {
      throw ValidationException::withMessages([
        'qrPayload' => ['QR code is invalid or has expired. Please scan a fresh QR code.'],
      ]);
    }

    $ojt = $this->getOngoingOjt($user);

    if ((int) $ojt->office_id !== $officeId) {
      throw ValidationException::withMessages([
        'qrPayload' => ['This QR code belongs to a different office.'],
      ]);
    }

    $today = Carbon::now(TimeService::TIMEZONE)->toDateString();

    $attendance = Attendance::firstOrNew([
      'student_id' => $user->id,
      'date' => $today,
    ]);

    $attendance->ojt_id = $ojt->id;

    $this->timeService->logNextSlot($attendance, null, true);

    $attendance->save();

    $attendance->load(['ojt.student', 'ojt.supervisor.supervisorDetail', 'ojt.office']);

    return response()->json(
      AttendanceResource::make($attendance)
    );
  }
}
