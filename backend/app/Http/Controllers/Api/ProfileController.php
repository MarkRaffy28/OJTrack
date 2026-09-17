<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRoles;
use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\UpdateEmergencyContactRequest;
use App\Http\Requests\Profile\UpdatePersonalInformationRequest;
use App\Http\Requests\Profile\UpdateProfilePictureRequest;
use App\Http\Resources\UserResource;
use App\Models\EmergencyContact;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use LogicException;

class ProfileController extends Controller {
  public function updateEmergencyContact(UpdateEmergencyContactRequest $request): JsonResponse {
    $user = $request->user();
    $data = $request->validated();

    if ($user->role !== UserRoles::STUDENT) {
      throw new LogicException(
        "Only students can update their emergency contacts."
      );
    }

    $contactData = [
      'name' => $data['emergencyContact']['name'],
      'relationship' => $data['emergencyContact']['relationship'],
      'contact_number' => $data['emergencyContact']['contactNumber'],
      'address' => $data['emergencyContact']['address'],
    ];

    EmergencyContact::updateOrCreate(
      [
        'user_id' => $user->id,
        'is_primary' => true,
      ],
      $contactData
    );

    return response()->json([
      'user' => UserResource::make($this->freshUserWithProfileDetails($user)),
    ]);
  }

  public function updatePersonalInformation(UpdatePersonalInformationRequest $request): JsonResponse {
    $user = $request->user();
    $data = $request->validated();

    $email_changed = $user->email !== $data['email'];

    $user->forceFill([
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
      'email_verified_at' => $email_changed ? null : $user->email_verified_at,
    ])->save();

    return response()->json([
      'user' => UserResource::make($this->freshUserWithProfileDetails($user)),
    ]);
  }

  public function updateProfilePicture(UpdateProfilePictureRequest $request): JsonResponse {
    $user = $request->user();
    $uploadedFile = $request->file('profile_picture');

    $user->update([
      'profile_picture' => $uploadedFile->getContent(),
    ]);

    return response()->json([
      'user' => UserResource::make($this->freshUserWithProfileDetails($user)),
    ]);
  }

  private function freshUserWithProfileDetails(User $user): User {
    return $user->fresh([
      'studentDetail',
      'instructorDetail',
      'supervisorDetail.office',
      'emergencyContacts',
    ]);
  }
}
