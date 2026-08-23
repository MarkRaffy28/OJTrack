<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdateProfilePictureRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller {
  public function updateProfilePicture(UpdateProfilePictureRequest $request): JsonResponse {
    $user = $request->user();

    $user->profile_picture = $request->file('profile_picture')->getContent();

    $user->save();

    return response()->json([
      'user' => UserResource::make($user),
    ]);
  }
}