<?php

namespace App\Services;

use App\Enums\AccountStatus;
use App\Exceptions\InvalidCredentialsException;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;
use LogicException;

class AuthService {
  public function login(string $identifier, string $password): array {
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
    ]);

    $token = $user->createToken("auth-token")->plainTextToken;

    return [
      "user" => $user,
      "access_token" => $token,
      "token_type" => "Bearer",
    ];
  }

  public function registerStudent(User $user, array $data): User {
    return DB::transaction(function () use ($user, $data) {
      if ($user->status !== AccountStatus::PRE_ACTIVATED) {
        throw new LogicException('This account is not available for registration.');
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
        'address' => $data['address'],
        'contact_number' => $data['contactNumber'],
        'email' => $data['email'],
        'status' => AccountStatus::ACTIVE,
        'activated_at' => now(),
      ]);

      $user->studentDetail()->create([
        'year' => $data['year'],
        'program' => $data['program'],
        'major' => $data['major'],
        'section' => $data['section'],
      ]);

      return $user->load('studentDetail');
    });
  }

  public function registerSupervisor(User $user, array $data): User {
    if ($user->status !== AccountStatus::PRE_ACTIVATED) {
      throw new LogicException('This account is not available for registration.');
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
      'address' => $data['address'],
      'contact_number' => $data['contactNumber'],
      'email' => $data['email'],
      'status' => AccountStatus::ACTIVE,
      'activated_at' => now(),
    ]);

    return $user->load('supervisorDetail.office');
  }

  public function logout(User $user): void {
    $token = $user->currentAccessToken();

    if ($token instanceof PersonalAccessToken) {
      $token->delete();
    }
  }
}