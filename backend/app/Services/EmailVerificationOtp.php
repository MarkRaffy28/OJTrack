<?php

namespace App\Services;

use App\Mail\OTPCodeMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use LogicException;

class EmailVerificationOtp {
  public function __construct(
    private readonly OtpService $otpService,
  ) {
  }

  public function send(User $user): void {
    if ($user->hasVerifiedEmail()) {
      throw new LogicException(
        'Email address is already verified.'
      );
    }

    $otp = $this->otpService->generate(
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
  }

  public function verify(User $user, string $otp): User {
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

    $expectedOtp = $this->otpService->generate(
      "email-verification:{$user->id}",
    );

    if (!hash_equals($expectedOtp, $otp)) {
      throw new LogicException(
        'Invalid or expired verification code.'
      );
    }

    $user->markEmailAsVerified();

    return $user->fresh();
  }
}