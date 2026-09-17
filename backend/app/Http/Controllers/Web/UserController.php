<?php

namespace App\Http\Controllers\Web;

use App\Enums\AccountStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\UserRequest;
use App\Models\User;
use App\Traits\ScopesForInstructor;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class UserController extends Controller {
  use ScopesForInstructor;

  public function index(): View {
    $search = trim((string) request('search'));

    $query = User::query()
      ->with('studentDetail', 'supervisorDetail', 'instructorDetail')
      ->when($search !== '', function ($query) use ($search) {
        $query->where(function ($q) use ($search) {
          $q->where('first_name', 'like', "%{$search}%")
            ->orWhere('middle_name', 'like', "%{$search}%")
            ->orWhere('last_name', 'like', "%{$search}%")
            ->orWhere('username', 'like', "%{$search}%")
            ->orWhere('email', 'like', "%{$search}%");
        });
      })
      ->when(request()->filled('role'), fn($q) => $q->where('role', request('role')))
      ->when(request()->filled('status'), fn($q) => $q->where('status', request('status')));

    $users = $this->applyInstructorSectionScope($query, null, 'self')
      ->paginate(10)
      ->withQueryString();

    return view("shared.users.index", compact("users"));
  }

  public function create(): View {
    return view("shared.users.create");
  }

  public function store(UserRequest $request) {
    $data = $request->validated();

    $password = $request->input('password');

    if ($request->input('status') === AccountStatus::PRE_ACTIVATED->value) {
      $password = 'ONWARDSUIP';
    }

    DB::transaction(function () use ($data, $password, $request) {
      $user = User::create([
        'profile_picture' => $request->hasFile('profile_picture')
          ? $request->file('profile_picture')->getContent()
          : null,

        'user_id' => $data['user_id'],

        'username' => $data['username'] ?? null,
        'password' => $password,

        'first_name' => $data['first_name'],
        'middle_name' => $data['middle_name'] ?? null,
        'last_name' => $data['last_name'],
        'extension_name' => $data['extension_name'] ?? null,

        'birth_date' => $data['birth_date'] ?? null,
        'gender' => $data['gender'] ?? null,

        'home_address' => $data['home_address'] ?? null,
        'present_address' => $data['present_address'] ?? null,
        'contact_number' => $data['contact_number'] ?? null,
        'email' => $data['email'] ?? null,

        'role' => $data['role'],
        'status' => $data['status'],
      ]);

      switch ($data['role']) {
        case 'student':
          $user->studentDetail()->create([
            'year' => $data['year'],
            'program' => $data['program'],
            'major' => $data['major'],
            'section' => $data['section'],
          ]);

          $emergencyContact = $data['emergency_contact'] ?? [];
          if ($this->hasCompleteEmergencyContact($emergencyContact)) {
            $user->emergencyContacts()->create([
              'name' => $emergencyContact['name'],
              'relationship' => $emergencyContact['relationship'],
              'contact_number' => $emergencyContact['contact_number'],
              'address' => $emergencyContact['address'],
              'is_primary' => true,
            ]);
          }
          break;

        case 'supervisor':
          $user->supervisorDetail()->create([
            'office_id' => $data['office_id'],
            'position' => $data['position'],
          ]);
          break;

        case 'instructor':
          $user->instructorDetail()->create([
            'department' => $data['department'],
            'section' => $data['section'],
          ]);
          break;
      }
    });

    $role = Auth::user()->role;

    return redirect()
      ->route("web.{$role->value}.users.index")
      ->with('success', 'User created successfully.');
  }

  public function show(User $user): View {
    $this->authorizeInstructorStudentAccess($user);

    return view("shared.users.show", compact("user"));
  }

  public function edit(User $user): View {
    $this->authorizeInstructorStudentAccess($user);

    return view("shared.users.edit", compact("user"));
  }

  public function update(UserRequest $request, User $user) {
    $this->authorizeInstructorStudentAccess($user);

    $data = $request->validated();

    DB::transaction(function () use ($data, $request, $user) {
      $user->update([
        'profile_picture' => $request->hasFile('profile_picture')
          ? $request->file('profile_picture')->getContent()
          : $user->profile_picture,

        'user_id' => $data['user_id'],

        'username' => $data['username'],

        'first_name' => $data['first_name'],
        'middle_name' => $data['middle_name'] ?? null,
        'last_name' => $data['last_name'],
        'extension_name' => $data['extension_name'] ?? null,

        'birth_date' => $data['birth_date'] ?? null,
        'gender' => $data['gender'] ?? null,

        'home_address' => $data['home_address'] ?? null,
        'present_address' => $data['present_address'] ?? null,
        'contact_number' => $data['contact_number'] ?? null,
        'email' => $data['email'] ?? null,

        'role' => $data['role'],
        'status' => $data['status'],
      ]);

      switch ($data['role']) {
        case 'student':
          $user->studentDetail()->updateOrCreate(
            ['user_id' => $user->id],
            [
              'year' => $data['year'],
              'program' => $data['program'],
              'major' => $data['major'],
              'section' => $data['section'],
            ]
          );

          $emergencyContact = $user->emergencyContacts()
            ->where('is_primary', true)
            ->first();

          $emergencyContactData = $data['emergency_contact'] ?? [];

          if ($emergencyContact && $this->hasCompleteEmergencyContact($emergencyContactData)) {
            $emergencyContact->update([
              'name' => $emergencyContactData['name'],
              'relationship' => $emergencyContactData['relationship'],
              'contact_number' => $emergencyContactData['contact_number'],
              'address' => $emergencyContactData['address'],
            ]);
          } elseif (!$emergencyContact && $this->hasCompleteEmergencyContact($emergencyContactData)) {
            $user->emergencyContacts()->create([
              'name' => $emergencyContactData['name'],
              'relationship' => $emergencyContactData['relationship'],
              'contact_number' => $emergencyContactData['contact_number'],
              'address' => $emergencyContactData['address'],
              'is_primary' => true,
            ]);
          }
          break;

        case 'supervisor':
          $user->supervisorDetail()->updateOrCreate(
            ['user_id' => $user->id],
            [
              'office_id' => $data['office_id'],
              'position' => $data['position'],
            ]
          );
          break;

        case 'instructor':
          $user->instructorDetail()->updateOrCreate(
            ['user_id' => $user->id],
            [
              'department' => $data['department'],
              'section' => $data['section'],
            ]
          );
          break;
      }
    });

    $role = Auth::user()->role;

    return redirect()
      ->route("web.{$role->value}.users.index")
      ->with('success', 'User updated successfully.');
  }

  public function destroy(User $user) {
    $this->authorizeInstructorStudentAccess($user);

    $user->delete();
    $role = Auth::user()->role;

    return redirect()
      ->route("web.{$role->value}.users.index")
      ->with("success", "User deleted successfully.");
  }

  private function hasCompleteEmergencyContact(array $contact): bool {
    return collect(['name', 'relationship', 'contact_number', 'address'])
      ->every(fn(string $field) => filled($contact[$field] ?? null));
  }
}
