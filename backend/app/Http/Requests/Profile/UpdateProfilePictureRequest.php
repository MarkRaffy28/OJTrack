<?php

namespace App\Http\Requests\Profile;

use App\Http\Requests\BaseApiRequest;
use App\Rules\UserRules;

class UpdateProfilePictureRequest extends BaseApiRequest {
  public function authorize(): bool {
    return true;
  }

  public function rules(): array {
    return [
      'profile_picture' => UserRules::profilePicture(true),
    ];
  }
}