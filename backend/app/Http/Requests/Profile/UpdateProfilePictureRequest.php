<?php

namespace App\Http\Requests\Profile;

use App\Http\Requests\BaseApiRequest;

class UpdateProfilePictureRequest extends BaseApiRequest {
  public function rules(): array {
    return [
      'profile_picture' => [
        'required',
        'file',
        'image',
        'mimes:jpeg,jpg,png,webp',
        'max:5120',
      ],
    ];
  }
}