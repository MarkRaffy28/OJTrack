<?php

use App\Exceptions\InvalidCredentialsException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

return Application::configure(basePath: dirname(__DIR__))
  ->withRouting(
    web: __DIR__ . '/../routes/web.php',
    api: __DIR__ . '/../routes/api.php',
    commands: __DIR__ . '/../routes/console.php',
    health: '/up',
  )
  ->withMiddleware(function (Middleware $middleware): void {
    $middleware->redirectGuestsTo(fn() => route('web.login'));
    $middleware->redirectUsersTo(function () {
      $user = Auth::user();
      if ($user) {
        if ($user->role === \App\Enums\UserRoles::INSTRUCTOR && $user->status === \App\Enums\AccountStatus::PRE_ACTIVATED) {
          return route('web.register');
        }
        return route('web.' . $user->role->value . '.dashboard');
      }
      return route('web.login');
    });
  })
  ->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->render(fn(InvalidCredentialsException $e, Request $request) =>
      response()->json([
        'message' => $e->getMessage(),
        'code' => 'AUTH_INVALID_CREDENTIALS',
      ], 401));
  })->create();
