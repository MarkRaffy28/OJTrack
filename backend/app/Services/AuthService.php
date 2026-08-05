<?php

namespace App\Services;

use App\Exceptions\InvalidCredentialsException;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

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

  public function logout(User $user): void {
    $token = $user->currentAccessToken();

    if ($token instanceof PersonalAccessToken) {
      $token->delete();
    }
  }
}