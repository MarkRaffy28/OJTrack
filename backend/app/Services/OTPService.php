<?php

namespace App\Services;

class OtpService {
  private const WINDOW_SECONDS = 300;
  private const OTP_LENGTH = 6;

  public function generate(string $subject): string {
    $window = intdiv(
      now()->timestamp,
      self::WINDOW_SECONDS,
    );

    $hash = hash_hmac(
      'sha256',
      "{$subject}:{$window}",
      config('services.email_otp.secret'),
    );

    $number = hexdec(substr($hash, 0, 8));

    return str_pad(
      (string) ($number % 1_000_000),
      self::OTP_LENGTH,
      '0',
      STR_PAD_LEFT,
    );
  }

  public function verify(string $subject, string $otp): bool {
    if (!preg_match('/^\d{6}$/', $otp)) {
      return false;
    }

    return hash_equals(
      $this->generate($subject),
      $otp,
    );
  }
}