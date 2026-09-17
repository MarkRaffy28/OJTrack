<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\EmailVerificationRequest;
use App\Http\Resources\UserResource;
use App\Mail\OTPCodeMail;
use App\Services\EmailVerificationOtp;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use LogicException;

class EmailVerificationController extends Controller {
  public function __construct(
    private readonly EmailVerificationOtp $emailVerificationOtpService,
  ) {
  }

  public function send(Request $request): JsonResponse {
    $user = $request->user();

    if ($user->hasVerifiedEmail()) {
      throw new LogicException(
        'Email address is already verified.'
      );
    }

    $otp = $this->emailVerificationOtpService->generate(
      "email-verification:{$user->id}",
    );

    Mail::to($user->email)->send(
      new OTPCodeMail(
        name: $user->first_name,
        title: 'Verify Your Email',
        description: 'Enter the 6-digit verification code below to verify your email address.',
        otpLabel: 'Email Verification Code',
        otp: $otp,
      )
    );

    return response()->json([
      'message' => 'Verification code sent.',
    ]);
  }

  public function verify(EmailVerificationRequest $request): JsonResponse {
    $user = $request->user();
    $data = $request->validated();
    $otp = $data['otp'];

    if ($user->hasVerifiedEmail()) {
      throw new LogicException(
        'Email address is already verified.'
      );
    }

    if (!preg_match('/^\d{6}$/', $otp)) {
      throw new LogicException(
        'Invalid verification code.'
      );
    }

    $expectedOtp = $this->emailVerificationOtpService->generate(
      "email-verification:{$user->id}",
    );

    if (!hash_equals($expectedOtp, $otp)) {
      throw new LogicException(
        'Invalid or expired verification code.'
      );
    }

    $user->markEmailAsVerified();

    return response()->json([
      'user' => UserResource::make($user->fresh()),
    ]);
  }
}