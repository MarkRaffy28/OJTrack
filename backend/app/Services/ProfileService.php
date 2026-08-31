<?php

namespace App\Services;

use App\Enums\UserRoles;
use App\Models\EmergencyContact;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use LogicException;

class ProfileService {
  public function updateEmergencyContact(User $user, array $data): User {
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

    return $user->fresh();
  }

  public function updatePersonalInformation(User $user, array $data): User {
    $user->update([
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
    ]);

    return $user->fresh();
  }

  public function updateProfilePicture(User $user, UploadedFile $uploadedFile): User {
    $user->update([
      'profile_picture' => $uploadedFile->getContent(),
    ]);

    return $user->fresh();
  }
}