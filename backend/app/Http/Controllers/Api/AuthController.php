<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterStudentRequest;
use App\Http\Requests\Auth\RegisterSupervisorRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller {
  public function __construct(
    private readonly AuthService $authService
  ) {
  }

  public function login(LoginRequest $request): JsonResponse {
    $result = $this->authService->login(
      $request->validated('identifier'),
      $request->validated('password'),
    );

    return response()->json([
      'accessToken' => $result['access_token'],
      'tokenType' => $result['token_type'],
      'user' => new UserResource($result['user']),
    ]);
  }

  public function registerStudent(RegisterStudentRequest $request): JsonResponse {
    $user = $this->authService->registerStudent(
      $request->user(),
      $request->validated(),
    );

    return response()->json([
      'user' => new UserResource($user),
    ]);
  }
  public function registerSupervisor(RegisterSupervisorRequest $request): JsonResponse {
    $user = $this->authService->registerSupervisor(
      $request->user(),
      $request->validated(),
    );

    return response()->json([
      'user' => new UserResource($user),
    ]);
  }

  public function me(Request $request): UserResource {
    return new UserResource($request->user());
  }

  public function logout(Request $request): JsonResponse {
    $this->authService->logout($request->user());

    return response()->json([
      'message' => 'Logged out successfully.',
    ]);
  }
}
