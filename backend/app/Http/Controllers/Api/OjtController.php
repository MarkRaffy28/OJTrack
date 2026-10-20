<?php

namespace App\Http\Controllers\Api;

use App\Enums\OjtStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\StudentOjtResource;
use App\Models\StudentOjt;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class OjtController extends Controller {
  public function index(Request $request) {
    $user = $request->user();

    if ($user->role === UserRole::SUPERVISOR) {
      $ojts = StudentOjt::with(['student.studentDetail', 'supervisor.supervisorDetail', 'office', 'ojt'])
        ->whereHas('supervisor', fn ($supervisor) => $supervisor->whereKey($user->id))
        ->latest()
        ->get();

      return response()->json(
        StudentOjtResource::collection($ojts)
      );
    }

    return $this->show($request);
  }

  public function show(Request $request) {
    $user = $request->user();

    $ojt = StudentOjt::with(['student.studentDetail', 'supervisor.supervisorDetail', 'office', 'ojt'])
      ->where('student_id', $user->id)
      ->where('status', OjtStatus::ONGOING)
      ->latest()
      ->first();

    if (!$ojt) {
      $ojt = StudentOjt::with(['student.studentDetail', 'supervisor.supervisorDetail', 'office', 'ojt'])
        ->where('student_id', $user->id)
        ->latest()
        ->first();
    }

    if (!$ojt) {
      return response()->json([
        'message' => 'Not assigned yet',
      ], 404);
    }

    return response()->json(
      StudentOjtResource::make($ojt)
    );
  }

  public function showById(Request $request, int $id) {
    $user = $request->user();

    $query = StudentOjt::with(['student.studentDetail', 'supervisor.supervisorDetail', 'office', 'ojt'])
      ->where('id', $id);

    if ($user->role === UserRole::SUPERVISOR) {
      $query->whereHas('supervisor', fn ($supervisor) => $supervisor->whereKey($user->id));
    } else {
      $query->where('student_id', $user->id);
    }

    $ojt = $query->first();

    if (!$ojt) {
      return response()->json([
        'message' => 'OJT record not found',
      ], 404);
    }

    return response()->json(
      StudentOjtResource::make($ojt)
    );
  }

}
