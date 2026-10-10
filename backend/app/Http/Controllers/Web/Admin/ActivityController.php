<?php

namespace App\Http\Controllers\Web\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;

class ActivityController extends Controller {
  public function index(Request $request): View {
    abort_if(
      !in_array(
        $request->user()->role,
        [UserRole::ADMIN, UserRole::SUPER_ADMIN]
      ),
      403
    );

    $activities = Activity::query()
      ->with(['actor', 'ojt.student', 'subject'])
      ->when($request->filled('action'), fn($query) => $query->where('action', 'like', '%' . $request->string('action') . '%'))
      ->when($request->filled('user_id'), fn($query) => $query->where('user_id', $request->integer('user_id')))
      ->latest()
      ->paginate(25)
      ->withQueryString();

    return view('admin.activities.index', compact('activities'));
  }

  public function show(Request $request, Activity $activity): View {
    abort_if(
      !in_array(
        $request->user()->role,
        [UserRole::ADMIN, UserRole::SUPER_ADMIN]
      ),
      403
    );

    $activity->load(['actor', 'ojt.student', 'subject']);

    return view('admin.activities.show', compact('activity'));
  }
}
