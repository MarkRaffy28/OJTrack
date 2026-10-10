<?php

namespace App\Http\Controllers\Web;

use App\Enums\AccountStatus;
use App\Enums\ActivityAction;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\UserRequest;
use App\Models\User;
use App\Services\ActivityService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\Response;

class UserController extends Controller {

  public function index(Request $request): View|Response {
    Gate::authorize('viewAny', User::class);

    $viewer = Auth::user();

    $query = User::query()
      ->visibleTo($viewer)
      ->search($request->input('search'))
      ->filter($request->only([
        'role',
        'status',
      ]))
      ->sort(
        $request->input('sort', 'id'),
        $request->input('direction', 'asc'),
      );

    $headers = [
      ['label' => 'ID', 'key' => 'id'],
      ['label' => 'User ID', 'key' => 'user_id'],
      'Profile Picture',
      ['label' => 'Name', 'key' => 'full_name'],
      ['label' => 'Username', 'key' => 'username'],
      ['label' => 'Email', 'key' => 'email'],
      ['label' => 'Role', 'key' => 'role'],
      ['label' => 'Status', 'key' => 'status'],
      'Actions',
    ];

    $roleOptions = collect(UserRole::cases())
      ->reject(fn(UserRole $role) => $role === UserRole::SUPER_ADMIN)
      ->when(
        !$viewer->isSuperAdmin(),
        fn($roles) => $roles->reject(
          fn(UserRole $role) => $role === UserRole::ADMIN
        )
      )
      ->map(fn(UserRole $role) => [
        'value' => $role->value,
        'label' => ucwords($role->value),
      ])
      ->values()
      ->all();

    $filters = [
      [
        'name' => 'role',
        'label' => 'Role',
        'options' => $roleOptions,
      ],
      [
        'name' => 'status',
        'label' => 'Status',
        'options' => AccountStatus::options(),
      ],
    ];

    if ($request->boolean('print')) {
      $users = $query
        ->with([
          'studentDetail',
          'supervisorDetail',
          'instructorDetail',
        ])
        ->get();

      return Pdf::loadView('shared.users.pdf', [
        'users' => $users,
      ])
        ->setPaper('a4', 'landscape')
        ->stream('users.pdf');
    }

    $users = $query
      ->paginate(20)
      ->withQueryString();

    return view('shared.users.index', [
      'users' => $users,
      'headers' => $headers,
      'filters' => $filters,
    ]);
  }

  public function create(): View {
    return view("shared.users.create");
  }

  public function store(UserRequest $request, ActivityService $activityService) {
    $data = $request->validated();

    $password = $request->input('password');

    if ($request->input('status') === AccountStatus::PRE_ACTIVATED->value) {
      $password = 'ONWARDSUIP';
    }

    $createdUser = null;

    DB::transaction(function () use ($data, $password, $request, &$createdUser) {
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

      $createdUser = $user;
    });

    $actor = Auth::user();
    $activityService->log($actor, ActivityAction::USER_CREATED, $createdUser);

    $role = $actor->role;

    return redirect()
      ->route("web.{$role->value}.users.index")
      ->with('success', 'User created successfully.');
  }

  public function show(User $user): View {
    Gate::authorize('view', $user);

    return view("shared.users.show", compact("user"));
  }

  public function edit(User $user): View {
    Gate::authorize('update', $user);

    return view("shared.users.edit", compact("user"));
  }

  public function update(UserRequest $request, User $user, ActivityService $activityService) {
    Gate::authorize('update', $user);

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

    $actor = Auth::user();
    $activityService->log($actor, ActivityAction::USER_UPDATED, $user);

    $role = $actor->role;

    return redirect()
      ->route("web.{$role->value}.users.index")
      ->with('success', 'User updated successfully.');
  }

  public function destroy(User $user, ActivityService $activityService) {
    Gate::authorize('delete', $user);

    $user->delete();

    $actor = Auth::user();
    $activityService->log($actor, ActivityAction::USER_DELETED, $user);

    $role = $actor->role;

    return redirect()
      ->route("web.{$role->value}.users.index")
      ->with("success", "User deleted successfully.");
  }

  private function hasCompleteEmergencyContact(array $contact): bool {
    return collect(['name', 'relationship', 'contact_number', 'address'])
      ->every(fn(string $field) => filled($contact[$field] ?? null));
  }
}
