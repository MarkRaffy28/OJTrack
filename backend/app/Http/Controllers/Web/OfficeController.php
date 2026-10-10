<?php

namespace App\Http\Controllers\Web;

use App\Enums\ActivityAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\OfficeRequest;
use App\Models\Office;
use App\Services\ActivityService;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class OfficeController extends Controller {
  public function index(Request $request): View|Response {
    $query = Office::query()
      ->search($request->input('search'))
      ->sort(
        $request->input('sort', 'id'),
        $request->input('direction', 'asc')
      );

    $headers = [
      ['label' => 'ID', 'key' => 'id'],
      ['label' => 'Name', 'key' => 'name'],
      'Address',
      ['label' => 'Email', 'key' => 'contact_email'],
      'Contact Phone',
      'Morning Shift',
      'Afternoon Shift',
      'Actions',
    ];

    $filters = [];

    if ($request->boolean('print')) {
      $offices = $query
        ->withCount('supervisorDetails')
        ->get();

      return Pdf::loadView('shared.offices.pdf', [
        'offices' => $offices,
      ])
        ->setPaper('a4', 'landscape')
        ->stream('offices.pdf');
    }

    $offices = $query
      ->withCount('supervisorDetails')
      ->paginate(20)
      ->withQueryString();

    return view('shared.offices.index', [
      'offices' => $offices,
      'headers' => $headers,
      'filters' => $filters,
    ]);
  }

   public function create(): View {
    return view("shared.offices.create");
  }

  public function store(OfficeRequest $request, ActivityService $activityService) {
    $office = Office::create($request->validated());

    $actor = Auth::user();
    $activityService->log($actor, ActivityAction::OFFICE_CREATED, $office);

    $role = $actor->role;

    return redirect()
      ->route("web.{$role->value}.offices.index")
      ->with("success", "Office created successfully.");
  }

  public function show(Office $office): View {
    return view("shared.offices.show", compact("office"));
  }

  public function edit(Office $office): View {
    return view("shared.offices.edit", compact("office"));
  }

  public function update(OfficeRequest $request, Office $office, ActivityService $activityService) {
    $office->update($request->validated());

    $actor = Auth::user();
    $activityService->log($actor, ActivityAction::OFFICE_UPDATED, $office);

    $role = $actor->role;

    return redirect()
      ->route("web.{$role->value}.offices.index")
      ->with("success", "Office updated successfully.");
  }

  public function destroy(Office $office, ActivityService $activityService) {
    $office->delete();

    $actor = Auth::user();
    $activityService->log($actor, ActivityAction::OFFICE_DELETED, $office);

    $role = $actor->role;

    return redirect()
      ->route("web.{$role->value}.offices.index")
      ->with("success", "Office deleted successfully.");
  }
}
