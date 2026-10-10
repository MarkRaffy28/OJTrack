<?php

namespace App\Http\Controllers\Web;

use App\Enums\EvaluationStatus;
use App\Http\Controllers\Controller;
use App\Models\Evaluation;
use App\Models\StudentOjt;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class EvaluationController extends Controller {

  public function index(): View {
    Gate::authorize('viewAny', Evaluation::class);

    $viewer = Auth::user();

    $studentOjts = StudentOjt::query()
      ->with(['student', 'supervisor', 'office', 'evaluation'])
      ->whereHas('student', fn($q) => $q->visibleTo($viewer))
      ->latest()
      ->paginate(10);

    return view('shared.evaluations.index', compact('studentOjts'));
  }

  public function show(StudentOjt $studentOjt): View {
    Gate::authorize('view', $studentOjt->student);

    $studentOjt->load(['student', 'supervisor', 'office', 'evaluation']);

    return view('shared.evaluations.show', compact('studentOjt'));
  }

  public function edit(StudentOjt $studentOjt): View {
    Gate::authorize('update', $studentOjt->student);

    $studentOjt->load(['student', 'supervisor', 'office', 'evaluation']);

    return view('shared.evaluations.edit', compact('studentOjt'));
  }

  public function create(Request $request, ?StudentOjt $studentOjt = null): View|RedirectResponse {
    $viewer = Auth::user();

    if (!$studentOjt) {
      if ($request->filled('student_ojt_id')) {
        $studentOjt = StudentOjt::query()->findOrFail($request->integer('student_ojt_id'));
      } else {
        $studentOjts = StudentOjt::query()
          ->with(['student', 'office'])
          ->whereHas('student', fn($q) => $q->visibleTo($viewer))
          ->whereDoesntHave('evaluation')
          ->latest()
          ->get();

        return view('shared.evaluations.create', compact('studentOjts'));
      }
    }

    Gate::authorize('update', $studentOjt->student);

    $studentOjt->load(['student', 'supervisor', 'office', 'evaluation']);

    if ($studentOjt->evaluation) {
      return redirect()->route(
        'web.' . auth()->user()->role->value . '.evaluations.edit',
        $studentOjt,
      );
    }

    return view('shared.evaluations.create', compact('studentOjt'));
  }

  public function store(Request $request, ?StudentOjt $studentOjt = null): RedirectResponse {
    if (!$studentOjt) {
      $data = $request->validate([
        'student_ojt_id' => ['required', 'integer', 'exists:student_ojts,id'],
      ]);

      $studentOjt = StudentOjt::query()->findOrFail($data['student_ojt_id']);
    }

    Gate::authorize('update', $studentOjt->student);

    $studentOjt->load('evaluation');

    if ($studentOjt->evaluation) {
      return redirect()
        ->route('web.' . auth()->user()->role->value . '.evaluations.edit', $studentOjt)
        ->with('error', 'An evaluation already exists for this trainee.');
    }

    $this->persistEvaluation($request, $studentOjt);

    return redirect()
      ->route('web.' . auth()->user()->role->value . '.evaluations.show', $studentOjt)
      ->with('success', 'Evaluation created successfully.');
  }

  public function update(Request $request, StudentOjt $studentOjt): RedirectResponse {
    Gate::authorize('update', $studentOjt->student);

    $this->persistEvaluation($request, $studentOjt);

    return redirect()
      ->route('web.' . auth()->user()->role->value . '.evaluations.show', $studentOjt)
      ->with('success', 'Evaluation updated successfully.');
  }

  public function destroy(StudentOjt $studentOjt): RedirectResponse {
    Gate::authorize('delete', $studentOjt->student);

    $evaluation = $studentOjt->evaluation;

    if (!$evaluation) {
      return redirect()
        ->route('web.' . auth()->user()->role->value . '.evaluations.index')
        ->with('error', 'No evaluation exists for this trainee.');
    }

    $evaluation->delete();

    return redirect()
      ->route('web.' . auth()->user()->role->value . '.evaluations.index')
      ->with('success', 'Evaluation deleted successfully.');
  }

  private function persistEvaluation(Request $request, StudentOjt $studentOjt): Evaluation {

    $data = $request->validate([
      'quality' => ['required', 'integer', 'min:0', 'max:40'],
      'productivity' => ['required', 'integer', 'min:0', 'max:20'],
      'initiative' => ['required', 'integer', 'min:0', 'max:20'],
      'time_management_punctuality' => ['required', 'integer', 'min:0', 'max:10'],
      'proper_attire_grooming' => ['required', 'integer', 'min:0', 'max:10'],
      'remarks' => ['nullable', 'string'],
      'status' => ['required', 'in:draft,submitted,finalized'],
    ]);

    $evaluation = $studentOjt->evaluation ?: $studentOjt->evaluation()->make();
    $evaluation->fill($data);
    $evaluation->student_ojt_id = $studentOjt->id;
    $evaluation->total_points = $data['quality'] + $data['productivity'] + $data['initiative']
      + $data['time_management_punctuality'] + $data['proper_attire_grooming'];
    $evaluation->submitted_at = in_array($data['status'], ['submitted', 'finalized'], true)
      ? ($evaluation->submitted_at ?? now())
      : null;
    $evaluation->save();

    return $evaluation;
  }
}
