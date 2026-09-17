<?php

namespace App\Http\Controllers\Api;

use App\Enums\AccountStatus;
use App\Exceptions\InvalidCredentialsException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterStudentRequest;
use App\Http\Requests\Auth\RegisterSupervisorRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\VerifyForgotPasswordOTPRequest;
use App\Http\Resources\UserResource;
use App\Mail\OTPCodeMail;
use App\Models\User;
use App\Services\EmailVerificationOtp;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\PersonalAccessToken;
use LogicException;

class AuthController extends Controller {
  public function __construct(
    private readonly EmailVerificationOtp $emailVerificationOtpService,
  ) {
  }

  public function login(LoginRequest $request): JsonResponse {
    $identifier = $request->validated('identifier');
    $password = $request->validated('password');

    $user = User::query()
      ->where('user_id', $identifier)
      ->orWhere('username', $identifier)
      ->orWhere('email', $identifier)
      ->first();

    if (!$user || !Hash::check($password, $user->password)) {
      throw new InvalidCredentialsException("Invalid credentials.");
    }

    $user->loadMissing([
      'studentDetail',
      'instructorDetail',
      'supervisorDetail.office',
      'emergencyContacts',
    ]);

    $token = $user->createToken("auth-token")->plainTextToken;

    return response()->json([
      'accessToken' => $token,
      'tokenType' => 'Bearer',
      'user' => new UserResource($user),
    ]);
  }

  public function registerStudent(RegisterStudentRequest $request): JsonResponse {
    $user = $request->user();
    $data = $request->validated();

    $updatedUser = DB::transaction(function () use ($user, $data) {
      if ($user->status !== AccountStatus::PRE_ACTIVATED) {
        throw new LogicException('This account is not available for registration.');
      }

      $studentDetail = $user->studentDetail;

      if (!$studentDetail) {
        throw new LogicException("This student doesn't have Student Detail yet.");
      }

      $user->update([
        'password' => Hash::make($data['newPassword']),
        'username' => $data['username'],
        'first_name' => $data['firstName'],
        'middle_name' => $data['middleName'] ?? null,
        'last_name' => $data['lastName'],
        'extension_name' => $data['extensionName'] ?? null,
        'birth_date' => $data['birthDate'],
        'gender' => $data['gender'],
        'home_address' => $data['homeAddress'],
        'present_address' => $data['presentAddress'],
        'contact_number' => $data['contactNumber'],
        'email' => $data['email'],
        'status' => AccountStatus::ACTIVE,
        'activated_at' => now(),
      ]);

      $emergencyContact = $data['emergencyContact'];

      $user->emergencyContacts()->updateOrCreate(
        ['is_primary' => true],
        [
          'name' => $emergencyContact['name'],
          'relationship' => $emergencyContact['relationship'],
          'contact_number' => $emergencyContact['contactNumber'],
          'address' => $emergencyContact['address'],
        ],
      );

      return $user->load(['studentDetail', 'emergencyContacts']);
    });

    return response()->json([
      'user' => new UserResource($updatedUser),
    ]);
  }

  public function registerSupervisor(RegisterSupervisorRequest $request): JsonResponse {
    $user = $request->user();
    $data = $request->validated();

    if ($user->status !== AccountStatus::PRE_ACTIVATED) {
      throw new LogicException('This account is not available for registration.');
    }

    $supervisorDetail = $user->supervisorDetail;

    if (!$supervisorDetail || !$supervisorDetail->office_id) {
      throw new LogicException('This supervisor account has not been assigned an office.');
    }

    $user->update([
      'password' => Hash::make($data['newPassword']),
      'username' => $data['username'],
      'first_name' => $data['firstName'],
      'middle_name' => $data['middleName'] ?? null,
      'last_name' => $data['lastName'],
      'extension_name' => $data['extensionName'] ?? null,
      'birth_date' => $data['birthDate'],
      'gender' => $data['gender'],
      'home_address' => $data['homeAddress'],
      'present_address' => $data['presentAddress'],
      'contact_number' => $data['contactNumber'],
      'email' => $data['email'],
      'status' => AccountStatus::ACTIVE,
      'activated_at' => now(),
    ]);

    $user->load('supervisorDetail.office');

    return response()->json([
      'user' => new UserResource($user),
    ]);
  }

  public function forgotPassword(ForgotPasswordRequest $request): JsonResponse {
    $email = $request->validated('email');
    $user = User::query()->where('email', $email)->first();

    if (!$user) {
      throw new LogicException('No account found with that email address.');
    }

    if (!$user->hasVerifiedEmail()) {
      throw new LogicException('Email address is unverified.');
    }

    $otp = $this->emailVerificationOtpService->generate(
      "forgot-password:{$user->id}"
    );

    Cache::put("forgot_password_otp:{$user->id}", $otp, now()->addMinutes(5));

    Mail::to($user->email)->send(
      new OTPCodeMail(
        name: $user->first_name,
        title: 'Reset Your Password',
        description: 'Enter the 6-digit verification code below to reset your password.',
        otpLabel: 'Password Reset Code',
        otp: $otp,
      )
    );

    return response()->json([
      'message' => 'Verification code sent.',
    ]);
  }

  public function verifyForgotPassword(VerifyForgotPasswordOTPRequest $request): JsonResponse {
    $email = $request->validated('email');

    $user = User::query()->where('email', $email)->first();

    if (!$user) {
      throw new LogicException('No account found with that email address.');
    }

    if (!$user->hasVerifiedEmail()) {
      throw new LogicException('Email address is unverified.');
    }

    $otp = $request->validated('otp');
    $cachedOtp = Cache::get("forgot_password_otp:{$user->id}");

    if (!$cachedOtp || !hash_equals((string) $cachedOtp, (string) $otp)) {
      throw new LogicException('Invalid or expired verification code.');
    }

    Cache::forget("forgot_password_otp:{$user->id}");
    Cache::put("forgot_password_verified:{$user->id}", true, now()->addMinutes(15));

    return response()->json([
      'message' => 'Verification successful.',
    ]);
  }

  public function resetPassword(ResetPasswordRequest $request): JsonResponse {
    $email = $request->validated('email');
    $user = User::query()->where('email', $email)->first();

    if (!$user) {
      throw new LogicException('No account found with that email address.');
    }

    if (!$user->hasVerifiedEmail()) {
      throw new LogicException('Email address is unverified.');
    }

    if (!Cache::get("forgot_password_verified:{$user->id}")) {
      throw new LogicException('Verification expired or incomplete. Please request a new verification code.');
    }

    $data = $request->validated();

    if (Hash::check($data['newPassword'], $user->password)) {
      throw new LogicException('The new password must be different from your current password.');
    }

    $user->update([
      'password' => Hash::make($data['newPassword']),
    ]);

    Cache::forget("forgot_password_verified:{$user->id}");

    return response()->json([
      'message' => 'Password reset successfully.',
    ]);
  }

  public function changePassword(ChangePasswordRequest $request): JsonResponse {
    $user = $request->user();
    $data = $request->validated();

    if (!Hash::check($data['currentPassword'], $user->password)) {
      throw new LogicException('The current password is incorrect.');
    }

    if (Hash::check($data['newPassword'], $user->password)) {
      throw new LogicException('The new password must be different from your current password.');
    }

    $user->update([
      'password' => Hash::make($data['newPassword']),
    ]);

    return response()->json([
      'message' => 'Password changed successfully.',
    ]);
  }

  public function me(Request $request): UserResource {
    return new UserResource($request->user());
  }

  public function logout(Request $request): JsonResponse {
    $user = $request->user();
    $token = $user->currentAccessToken();

    if ($token instanceof PersonalAccessToken) {
      $token->delete();
    }

    return response()->json([
      'message' => 'Logged out successfully.',
    ]);
  }
}
