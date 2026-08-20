<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseApiRequest;

class RegisterSupervisorRequest extends BaseApiRequest {
  public function authorize(): bool {
    return true;
  }

  public function rules(): array {
    return [
      'newPassword' => ['required', 'string', 'min:8', 'max:255'],
      'confirmPassword' => ['required', 'same:newPassword'],

      'username' => ['required', 'string', 'max:100', 'unique:users,username'],

      'firstName' => ['required', 'string', 'max:100'],
      'middleName' => ['nullable', 'string', 'max:50'],
      'lastName' => ['required', 'string', 'max:50'],
      'extensionName' => ['nullable', 'string', 'max:10'],

      'birthDate' => ['required', 'date'],
      'gender' => ['required', 'in:Male,Female,Other'],

      'homeAddress' => ['required', 'string', 'max:255'],
      'presentAddress' => ['required', 'string', 'max:255'],
      'contactNumber' => ['required', 'string', 'max:15'],
      'email' => ['required', 'email', 'max:100', 'unique:users,email'],
    ];
  }
}