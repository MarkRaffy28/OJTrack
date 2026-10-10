<?php

namespace App\Services;

use Carbon\Carbon;

class QrCodeTokenService {
  private const WINDOW_SECONDS = 60;

  /**
   * Generate a time-windowed token for a given office.
   */
  public function generate(int $officeId, ?int $timestamp = null): string {
    $ts = $timestamp ?? now()->timestamp;
    $window = intdiv($ts, self::WINDOW_SECONDS);

    $hash = $this->hashOfficeWindow($officeId, $window);

    return "{$officeId}:{$hash}";
  }

  /**
   * Verify if the provided token matches the officeId for current or previous time window.
   */
  public function verify(int $officeId, string $token): bool {
    $parts = explode(':', $token, 2);
    if (count($parts) !== 2) {
      return false;
    }

    [$tokenOfficeId, $tokenHash] = $parts;
    if ((int) $tokenOfficeId !== $officeId) {
      return false;
    }

    $currentWindow = intdiv(now()->timestamp, self::WINDOW_SECONDS);
    
    // Check current window & previous window (for grace period / network delays)
    foreach ([$currentWindow, $currentWindow - 1] as $window) {
      $expectedHash = $this->hashOfficeWindow($officeId, $window);
      if (hash_equals($expectedHash, $tokenHash)) {
        return true;
      }
    }

    return false;
  }

  private function hashOfficeWindow(int $officeId, int $window): string {
    $secret = config('app.key') ?? 'qr-secret-key';
    return hash_hmac(
      'sha256',
      "office:{$officeId}:window:{$window}",
      $secret
    );
  }
}
