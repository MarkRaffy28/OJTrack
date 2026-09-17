<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\Web\OfficeRequest;
use App\Models\Office;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Auth;

class OfficeController extends Controller {
  public function index(): View {
    $search = trim((string) request('search'));

    $offices = Office::query()
      ->when($search !== '', function ($query, $search) {
        $query->where(function ($q) use ($search) {
          $q->where('name', 'like', "%{$search}%")
            ->orWhere('address', 'like', "%{$search}%")
            ->orWhere('contact_email', 'like', "%{$search}%")
            ->orWhere('contact_phone', 'like', "%{$search}%");
        });
      })
      ->when(request()->filled('status'), fn($query, $status = null) => $query->where('status', request('status')))
      ->latest()
      ->paginate(10)
      ->withQueryString();

    return view("shared.offices.index", compact("offices"));
  }

  public function create(): View {
    return view("shared.offices.create");
  }

  public function store(OfficeRequest $request) {
    Office::create($request->validated());

    $role = Auth::user()->role;

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

  public function update(OfficeRequest $request, Office $office) {
    $office->update($request->validated());

    $role = Auth::user()->role;

    return redirect()
      ->route("web.{$role->value}.offices.index")
      ->with("success", "Office updated successfully.");
  }

  public function destroy(Office $office) {
    $office->delete();

    $role = Auth::user()->role;

    return redirect()
      ->route("web.{$role->value}.offices.index")
      ->with("success", "Office deleted successfully.");
  }
}