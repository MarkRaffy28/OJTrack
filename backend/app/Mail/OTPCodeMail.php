<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OTPCodeMail extends Mailable {
  use Queueable, SerializesModels;

  public function __construct(
    public string $name,
    public string $title,
    public string $description,
    public string $otpLabel,
    public string $otp,
  ) {
  }

  public function build() {
    return $this
      ->subject('Your OJTrack verification code')
      ->view('emails.auth.otp-code');
  }
}