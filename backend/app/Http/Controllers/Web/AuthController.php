<?php

namespace App\Http\Controllers\Web;

use App\Enums\AccountStatus;
use App\Enums\UserRoles;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use LogicException;

class AuthController extends Controller {
  public function index() {
    if (Auth::check()) {
      $user = Auth::user();
      if ($user->role === UserRoles::INSTRUCTOR && $user->status === AccountStatus::PRE_ACTIVATED) {
        return redirect()->route("web.register");
      }
      return redirect()->route("web.{$user->role->value}.dashboard");
    }
    return view("auth.login");
  }

  public function store(LoginRequest $request) {
    $identifier = $request->validated('identifier');
    $password = $request->validated('password');

    $user = User::query()
      ->where('user_id', $identifier)
      ->orWhere('username', $identifier)
      ->orWhere('email', $identifier)
      ->first();

    if (!$user || !Hash::check($password, $user->password)) {
      return back()
        ->withInput($request->only('identifier'))
        ->with('error', 'Invalid credentials.');
    }

    $allowedRoles = [UserRoles::ADMIN, UserRoles::INSTRUCTOR, UserRoles::SUPERVISOR];

    if (!in_array($user->role, $allowedRoles)) {
      return back()
        ->withInput($request->only('identifier'))
        ->with('error', 'Access denied. Please use the mobile app.');
    }

    Auth::login($user);

    $request->session()->regenerate();

    if ($user->role === UserRoles::INSTRUCTOR && $user->status === AccountStatus::PRE_ACTIVATED) {
      return redirect()->route('web.register')
        ->with('info', 'Please complete your instructor registration to activate your account.');
    }

    return redirect()->intended(
      route("web.{$user->role->value}.dashboard")
    )->with("success", "Welcome back, " . ($user->name ?? $user->username) . "!");
  }

  public function showRegister(): View|RedirectResponse {
    $user = Auth::user();

    if ($user->role !== UserRoles::INSTRUCTOR) {
      abort(403, 'Web registration is only available for instructors.');
    }

    if ($user->status !== AccountStatus::PRE_ACTIVATED) {
      return redirect()->route("web.{$user->role->value}.dashboard");
    }

    if (!$user->instructorDetail) {
      throw new LogicException('This instructor account has not been assigned an instructor detail.');
    }

    return view('auth.register', compact('user'));
  }

  public function registerInstructor(Request $request) {
    $user = Auth::user();

    if ($user->role !== UserRoles::INSTRUCTOR) {
      abort(403, 'Web registration is only available for instructors.');
    }

    if ($user->status !== AccountStatus::PRE_ACTIVATED) {
      return redirect()->route("web.{$user->role->value}.dashboard");
    }

    if (!$user->instructorDetail) {
      throw new LogicException('This instructor account has not been assigned an instructor detail.');
    }

    $validated = $request->validate([
      'username' => ['required', 'string', 'max:255', Rule::unique('users', 'username')->ignore($user->id)],
      'password' => ['required', 'string', 'min:8', 'confirmed'],
      'first_name' => ['required', 'string', 'max:255'],
      'middle_name' => ['nullable', 'string', 'max:255'],
      'last_name' => ['required', 'string', 'max:255'],
      'extension_name' => ['nullable', 'string', 'max:255'],
      'birth_date' => ['required', 'date'],
      'gender' => ['required', 'string', 'in:male,female,other'],
      'home_address' => ['required', 'string'],
      'present_address' => ['required', 'string'],
      'contact_number' => ['required', 'string'],
      'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
    ]);

    $user->update([
      'password' => Hash::make($validated['password']),
      'username' => $validated['username'],
      'first_name' => $validated['first_name'],
      'middle_name' => $validated['middle_name'] ?? null,
      'last_name' => $validated['last_name'],
      'extension_name' => $validated['extension_name'] ?? null,
      'birth_date' => $validated['birth_date'],
      'gender' => $validated['gender'],
      'home_address' => $validated['home_address'],
      'present_address' => $validated['present_address'],
      'contact_number' => $validated['contact_number'],
      'email' => $validated['email'],
      'status' => AccountStatus::ACTIVE,
      'activated_at' => now(),
    ]);

    return redirect()
      ->route('web.instructor.dashboard')
      ->with('success', 'Registration completed successfully. Welcome to OJTrack!');
  }

  public function logout() {
    Auth::logout();

    request()->session()->invalidate();
    request()->session()->regenerateToken();

    return redirect()->route('web.login');
  }
}