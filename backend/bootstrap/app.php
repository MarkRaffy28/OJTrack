<?php

use App\Enums\AccountStatus;
use App\Enums\UserRole;
use App\Exceptions\InvalidCredentialsException;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Middleware\RoleMiddleware;

return Application::configure(basePath: dirname(__DIR__))
  ->withRouting(
    web: __DIR__ . '/../routes/web.php',
    api: __DIR__ . '/../routes/api.php',
    commands: __DIR__ . '/../routes/console.php',
    health: '/up',
  )
  ->withSchedule(function (Schedule $schedule): void {
    $schedule->command('backup:automatic')->everyMinute()->withoutOverlapping();
  })
  ->withMiddleware(function (Middleware $middleware): void {
    $middleware->alias([
      'role' => RoleMiddleware::class,
    ]);

    $middleware->redirectGuestsTo(fn() => route('web.login'));
    $middleware->redirectUsersTo(function () {
      $user = Auth::user();
      
      if ($user) {
        if ($user->role === UserRole::INSTRUCTOR && $user->status === AccountStatus::PRE_ACTIVATED) {
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

    $exceptions->render(function (LogicException $e, Request $request) {
      if (!$request->is('api/*')) {
        return null;
      }

      return response()->json([
        'message' => $e->getMessage(),
      ], 422);
    });
  })->create();
