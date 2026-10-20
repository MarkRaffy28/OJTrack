<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware {
  public function handle(Request $request, Closure $next, string ...$roles): Response {
    $user = $request->user();

    abort_unless(
      $user && ($user->isAdmin() || $user->isSuperAdmin() || in_array($user->role->value, $roles, true)),
      403
    );

    return $next($request);
  }
}
