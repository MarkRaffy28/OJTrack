<?php

namespace App\Http\Controllers\Web;

use App\Enums\EvaluationStatus;
use App\Http\Controllers\Controller;
use App\Models\Evaluation;
use App\Models\StudentOjt;
use App\Traits\ScopesForInstructor;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EvaluationController extends Controller {
  use ScopesForInstructor;

  public function index(): View {
    $query = StudentOjt::query()
      ->with(['student', 'supervisor', 'office', 'evaluation'])
      ->latest();

    $studentOjts = $this->applyInstructorSectionScope($query, null, 'student')->paginate(10);
    return view('shared.evaluations.index', compact('studentOjts'));
  }

  public function show(StudentOjt $studentOjt): View {
    $this->authorizeInstructorStudentAccess($studentOjt->student);
    $studentOjt->load(['student', 'supervisor', 'office', 'evaluation']);
    return view('shared.evaluations.show', compact('studentOjt'));
  }

  public function edit(StudentOjt $studentOjt): View {
    $this->authorizeInstructorStudentAccess($studentOjt->student);
    $studentOjt->load(['student', 'supervisor', 'office', 'evaluation']);
    return view('shared.evaluations.edit', compact('studentOjt'));
  }

  public function create(Request $request, ?StudentOjt $studentOjt = null): View|RedirectResponse {
    if (!$studentOjt) {
      if ($request->filled('student_ojt_id')) {
        $studentOjt = StudentOjt::query()->findOrFail($request->integer('student_ojt_id'));
      } else {
      $studentOjts = $this->applyInstructorSectionScope(
        StudentOjt::query()->with(['student', 'office'])->latest(),
        null,
        'student',
      )->whereDoesntHave('evaluation')->get();

      return view('shared.evaluations.create', compact('studentOjts'));
      }
    }

    $this->authorizeInstructorStudentAccess($studentOjt->student);
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

    $this->authorizeInstructorStudentAccess($studentOjt->student);
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
    $this->authorizeInstructorStudentAccess($studentOjt->student);

    $this->persistEvaluation($request, $studentOjt);

    return redirect()
      ->route('web.' . auth()->user()->role->value . '.evaluations.show', $studentOjt)
      ->with('success', 'Evaluation updated successfully.');
  }

  public function destroy(StudentOjt $studentOjt): RedirectResponse {
    $this->authorizeInstructorStudentAccess($studentOjt->student);
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
