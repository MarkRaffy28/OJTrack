<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\EmailVerificationRequest;
use App\Http\Resources\UserResource;
use App\Services\EmailVerificationOtp;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller {
  public function __construct(
    private readonly EmailVerificationOtp $emailVerificationOtpService,
  ) {
  }

  public function send(Request $request): JsonResponse {
    $this->emailVerificationOtpService->send(
      $request->user(),
    );

    return response()->json([
      'message' => 'Verification code sent.',
    ]);
  }

  public function verify(EmailVerificationRequest $request): JsonResponse {
    $user = $this->emailVerificationOtpService->verify(
      $request->user(),
      $request->validated('otp'),
    );

    return response()->json([
      'user' => UserResource::make($user),
    ]);
  }
}