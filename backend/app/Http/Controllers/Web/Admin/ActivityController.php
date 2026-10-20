<?php

namespace App\Http\Controllers\Web\Admin;

use App\Enums\ActivityAction;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\User;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class ActivityController extends Controller {
  public function index(Request $request): View {
    Gate::authorize('viewAny', Activity::class);

    $viewer = Auth::user();

    $query = Activity::query()
      ->tap(fn($q) => $this->selectedCohortQuery($q, 'ojt.ojt'))
      ->with(['actor', 'ojt.student', 'subject'])
      ->filter($request->only([
        'user_id',
        'ojt_id',
        'action',
        'date_range',
      ]))
      ->sort(
        $request->input('sort', 'created_at'),
        $request->input('direction', 'desc')
      );

    $activities = $query
      ->paginate(25)
      ->withQueryString();

    $headers = [
      ['label' => 'ID', 'key' => 'id'],
      ['label' => 'Timestamp', 'key' => 'created_at'],
      ['label' => 'Actor', 'key' => 'user'],
      ['label' => 'Action', 'key' => 'action'],
      ['label' => 'Subject', 'key' => 'subject'],
      ['label' => 'Description', 'key' => 'description'],
      'Actions',
    ];

    $filters = [
      [
        'name' => 'action',
        'label' => 'Action',
        'options' => ActivityAction::options(),
        'searchable' => true,
      ],
      [
        'name' => 'user_id',
        'label' => 'Actor',
        'options' => User::query()
          ->visibleTo($viewer)
          ->orderBy('last_name')
          ->get()
          ->map(fn($user) => [
            'value' => $user->id,
            'label' => $user->full_name,
          ])
          ->toArray(),
        'searchable' => true,
      ],
    ];

    return view('admin.activities.index', [
      'activities' => $activities,
      'headers' => $headers,
      'filters' => $filters,
    ]);
  }

  public function show(Request $request, Activity $activity): View {
    Gate::authorize('view', $activity);

    $activity->load(['actor', 'ojt.student', 'subject']);

    return view('admin.activities.show', compact('activity'));
  }
}
