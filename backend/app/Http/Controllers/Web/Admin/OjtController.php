<?php

namespace App\Http\Controllers\Web\Admin;

use App\Enums\OjtTerm;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\OjtRequest;
use App\Models\Ojt;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Auth;

class OjtController extends Controller {
  public function index(): View {
    Gate::authorize('viewAny', Ojt::class);

    return view('admin.ojts.index', [
      'ojts' => Ojt::query()->withCount('studentOjts')->orderByDesc('academic_year')->orderBy('term')->paginate(10),
    ]);
  }

  public function create(): View {
    Gate::authorize('create', Ojt::class);

    return view('admin.ojts.form', ['ojt' => new Ojt(), 'terms' => OjtTerm::options()]);
  }

  public function show(Ojt $ojt): View {
    Gate::authorize('view', $ojt);
    $ojt->loadCount('studentOjts');

    return view('admin.ojts.show', compact('ojt'));
  }

  public function store(OjtRequest $request): RedirectResponse {
    Gate::authorize('create', Ojt::class);
    Ojt::create($request->validated());

    return redirect()->route("web." . Auth::user()->role->value . ".ojts.index")->with('success', 'OJT period created successfully.');
  }

  public function edit(Ojt $ojt): View {
    Gate::authorize('update', $ojt);

    return view('admin.ojts.form', ['ojt' => $ojt, 'terms' => OjtTerm::options()]);
  }

  public function update(OjtRequest $request, Ojt $ojt): RedirectResponse {
    Gate::authorize('update', $ojt);
    $ojt->update($request->validated());

    return redirect()->route("web." . Auth::user()->role->value . ".ojts.index")->with('success', 'OJT period updated successfully.');
  }

  public function destroy(Ojt $ojt): RedirectResponse {
    Gate::authorize('delete', $ojt);
    abort_if($ojt->studentOjts()->exists(), 422, 'This OJT period cannot be deleted because it has student assignments.');
    $ojt->delete();

    return redirect()->route("web." . Auth::user()->role->value . ".ojts.index")->with('success', 'OJT period deleted successfully.');
  }
}
