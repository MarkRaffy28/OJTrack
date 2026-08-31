<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdateEmergencyContactRequest;
use App\Http\Requests\Profile\UpdatePersonalInformationRequest;
use App\Http\Requests\Profile\UpdateProfilePictureRequest;
use App\Http\Resources\UserResource;
use App\Services\ProfileService;
use Illuminate\Http\JsonResponse;

class ProfileController extends Controller {
  public function __construct(
    private readonly ProfileService $profileService
  ) {
  }

  public function updateEmergencyContact(UpdateEmergencyContactRequest $request): JsonResponse {
    $user = $this->profileService->updateEmergencyContact(
      $request->user(),
      $request->validated(),
    );

    return response()->json([
      'user' => UserResource::make($user),
    ]);
  }

  public function updatePersonalInformation(UpdatePersonalInformationRequest $request): JsonResponse {
    $user = $this->profileService->updatePersonalInformation(
      $request->user(),
      $request->validated(),
    );

    return response()->json([
      'user' => UserResource::make($user),
    ]);
  }

  public function updateProfilePicture(UpdateProfilePictureRequest $request): JsonResponse {
    $user = $this->profileService->updateProfilePicture(
      $request->user(),
      $request->file('profile_picture'),
    );

    return response()->json([
      'user' => UserResource::make($user),
    ]);
  }
}