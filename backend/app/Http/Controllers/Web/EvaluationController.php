<?php

namespace App\Http\Controllers\Web;

use App\Enums\EvaluationStatus;
use App\Enums\Fields\EvaluationField;
use App\Enums\OjtStatus;
use App\Http\Controllers\Controller;
use App\Models\Evaluation;
use App\Models\EvaluationDetail;
use App\Models\Office;
use App\Models\StudentDetail;
use App\Models\StudentOjt;
use App\Support\EvaluationCriteria;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Barryvdh\DomPDF\Facade\Pdf;

class EvaluationController extends Controller {
  public function index(Request $request): View {
    Gate::authorize('viewAny', Evaluation::class);
    $viewer = Auth::user();
    $program = $request->input('program');
    $section = $request->input('section');
    $allEvaluations = $request->boolean('all_evaluations');

    if (!$section && !$allEvaluations) {
      $sectionDetails = StudentDetail::query()
        ->whereNotNull('program')->whereNotNull('section')
        ->whereHas('user', fn($q) => $q->visibleTo($viewer))
        ->select('program', 'section')->distinct()
        ->orderBy('program')->orderBy('section')->get();

      $sections = $sectionDetails->map(function ($detail) use ($viewer) {
        $count = StudentOjt::query()->tap(fn($q) => $this->selectedCohortQuery($q, 'ojt'))
          ->whereHas('student', fn($q) => $q->visibleTo($viewer))
          ->whereHas('student.studentDetail', fn($q) => $q->where('program', $detail->program)->where('section', $detail->section))->count();

        return ['program' => $detail->program, 'section' => $detail->section, 'label' => $detail->program . ' - ' . $detail->section, 'students_count' => $count];
      });

      $totalStudentsCount = StudentOjt::query()
        ->tap(fn($q) => $this->selectedCohortQuery($q, 'ojt'))
        ->whereHas('student', fn($q) => $q->visibleTo($viewer))
        ->count();

      return view('shared.evaluations.index', [
        'sections' => $sections,
        'totalStudentsCount' => $totalStudentsCount,
        'breadcrumbs' => [
          ['label' => 'Evaluations', 'url' => route('web.' . $viewer->role->value . '.evaluations.index')],
          ['label' => 'All Sections', 'url' => null],
        ],
      ]);
    }

    $isAdmin = $viewer->isAdmin() || $viewer->isSuperAdmin();
    $query = StudentOjt::query()->with(['student.studentDetail', 'office', 'instructor', 'supervisor', 'evaluation.details.evaluator'])
      ->whereHas('student', fn($q) => $q->visibleTo($viewer))
      ->tap(fn($q) => $this->selectedCohortQuery($q, 'ojt'))
      ->when($program, fn($q) => $q->whereHas('student.studentDetail', fn($s) => $s->where('program', $program)))
      ->when($section, fn($q) => $q->whereHas('student.studentDetail', fn($s) => $s->where('section', $section)))
      ->when($request->filled('student_id'), fn($q) => $q->where('student_id', $request->integer('student_id')))
      ->when($request->filled('office_id'), fn($q) => $q->where('office_id', $request->integer('office_id')))
      ->orderBy('id');

    if ($request->boolean('print')) {
      return Pdf::loadView('shared.evaluations.print', ['evaluations' => $query->get(), 'isAdmin' => $isAdmin])
        ->setPaper('a4', 'portrait')->stream('evaluations.pdf');
    }

    $students = $query->paginate(10)->withQueryString();

    $headers = [
      ['label' => 'ID', 'key' => 'id'],
      ['label' => 'Student', 'key' => 'student'],
      ['label' => 'Office', 'key' => 'office']];

    if ($isAdmin)
      $headers[] = ['label' => 'Instructor', 'key' => 'instructor'];

    $headers = array_merge($headers, [
      ['label' => 'Supervisor', 'key' => 'supervisor'],
      ['label' => 'Midterm', 'key' => 'midterm'],
      ['label' => 'Final', 'key' => 'final'],
      'View'
    ]);

    $studentsForFilter = StudentOjt::query()
    ->with('student')
    ->tap(fn($q) => $this->selectedCohortQuery($q, 'ojt'))
    ->whereHas('student', fn($q) => $q->visibleTo($viewer))
    ->get();

    $filters = [
      [
        'name' => 'student_id', 
        'label' => 'Student', 
        'options' => $studentsForFilter->map(fn($item) => 
          [
            'value' => $item->student_id, 
            'label' => $item->student?->full_name
          ])
          ->unique('value')
          ->values()
          ->all(), 
        'searchable' => true
        ],
      [
        'name' => 'office_id', 
        'label' => 'Office', 
        'options' => Office::query()
          ->orderBy('name')
          ->get()
          ->map(fn($office) => 
            [
              'value' => $office->id, 
              'label' => $office->name
            ])
            ->all(), 
        'searchable' => true
      ],
    ];

    $breadcrumbs = [
      ['label' => 'Evaluations', 'url' => route('web.' . $viewer->role->value . '.evaluations.index')],
    ];

    if ($allEvaluations) {
      $breadcrumbs[] = ['label' => 'All Students', 'url' => null];
    } elseif ($program && $section) {
      $breadcrumbs[] = [
        'label' => 'All Sections',
        'url' => route('web.' . $viewer->role->value . '.evaluations.index'),
      ];
      $breadcrumbs[] = ['label' => $program . ' - ' . $section, 'url' => null];
    }

    return view('shared.evaluations.index', [
      'evaluations' => $students,
      'headers' => $headers, 
      'filters' => $filters, 
      'currentProgram' => $program, 
      'currentSection' => $section,
      'isAdmin' => $isAdmin, 
      'breadcrumbs' => $breadcrumbs,
    ]);
  }

  public function show(Request $request, StudentOjt $studentOjt): View|Response {
    Gate::authorize('view', $studentOjt);
    $studentOjt->load(['student', 'instructor', 'supervisor', 'office', 'evaluation.details.evaluator']);
    if ($request->boolean('print')) {
      return Pdf::loadView('shared.evaluations.print', [
        'evaluations' => collect([$studentOjt]),
        'isAdmin' => Auth::user()->isAdmin() || Auth::user()->isSuperAdmin(),
      ])->setPaper('a4', 'portrait')->stream('student-evaluations.pdf');
    }
    return view('shared.evaluations.show', ['studentOjt' => $studentOjt]);
  }

  public function detailShow(StudentOjt $studentOjt, EvaluationDetail $evaluationDetail): View {
    $this->assertDetail($studentOjt, $evaluationDetail);
    Gate::authorize('view', $studentOjt);
    $evaluationDetail->load('evaluator');
    return view('shared.evaluations.detail', ['studentOjt' => $studentOjt, 'evaluationDetail' => $evaluationDetail, 'breadcrumbs' => [['label' => 'Evaluations', 'url' => route('web.' . Auth::user()->role->value . '.evaluations.index')], ['label' => $studentOjt->student?->full_name, 'url' => route('web.' . Auth::user()->role->value . '.evaluations.show', $studentOjt)], ['label' => 'Evaluation']]]);
  }

  public function edit(StudentOjt $studentOjt): View|RedirectResponse {
    $this->authorizeAdmin();
    Gate::authorize('view', $studentOjt);
    $evaluationDetail = $this->detail($studentOjt, 'supervisor', null);
    abort_unless($evaluationDetail, 404, 'Supervisor evaluation not found.');
    return view('shared.evaluations.edit', compact('studentOjt', 'evaluationDetail'));
  }

  public function destroy(StudentOjt $studentOjt): RedirectResponse {
    $this->authorizeAdmin();
    Gate::authorize('view', $studentOjt);
    $studentOjt->evaluation?->delete();
    return redirect()->route('web.' . Auth::user()->role->value . '.evaluations.index')->with('success', 'Evaluations deleted successfully.');
  }

  public function detailEdit(StudentOjt $studentOjt, EvaluationDetail $evaluationDetail): View {
    $this->assertDetail($studentOjt, $evaluationDetail);
    Gate::authorize('view', $studentOjt);
    $isAdmin = Auth::user()->isAdmin() || Auth::user()->isSuperAdmin();
    abort_unless($isAdmin || ($evaluationDetail->evaluation_type === 'instructor' && $evaluationDetail->status === EvaluationStatus::DRAFT), 403);
    return view('shared.evaluations.edit', ['studentOjt' => $studentOjt, 'evaluationDetail' => $evaluationDetail]);
  }

  public function detailDestroy(StudentOjt $studentOjt, EvaluationDetail $evaluationDetail): RedirectResponse {
    $this->assertDetail($studentOjt, $evaluationDetail);
    $this->authorizeAdmin();
    $evaluationDetail->delete();
    return redirect()->route('web.' . Auth::user()->role->value . '.evaluations.show', $studentOjt)->with('success', 'Evaluation deleted successfully.');
  }

  public function create(Request $request, ?StudentOjt $studentOjt = null): View {
    if (!$studentOjt && !$request->filled(EvaluationField::STUDENT_OJT_ID->value)) {
      $latestActiveOjtIds = StudentOjt::query()
        ->selectRaw('MAX(id)')
        ->where('status', '!=', OjtStatus::COMPLETED->value)
        ->groupBy('student_id');
      $studentOjts = StudentOjt::query()->with(['student', 'office', 'instructor', 'supervisor'])
        ->whereIn('id', $latestActiveOjtIds)
        ->whereHas('student', fn($q) => $q->visibleTo(Auth::user()))
        ->tap(fn($q) => $this->selectedCohortQuery($q, 'ojt'))
        ->when($request->input('program'), fn($q, $program) => $q->whereHas('student.studentDetail', fn($s) => $s->where('program', $program)))
        ->when($request->input('section'), fn($q, $section) => $q->whereHas('student.studentDetail', fn($s) => $s->where('section', $section)))
        ->whereDoesntHave('evaluation.details', fn($q) => $q
          ->where('evaluation_type', 'supervisor')
          ->whereIn('status', [EvaluationStatus::SUBMITTED->value, EvaluationStatus::FINALIZED->value]))
        ->orderBy('id')->get();
      abort_if($studentOjts->isEmpty(), 404, 'No students are missing a supervisor evaluation.');
      $studentOjt = $studentOjts->first();
      $evaluationDetail = null;
      return view('shared.evaluations.create', compact('studentOjts', 'studentOjt', 'evaluationDetail'));
    }
    $studentOjt ??= StudentOjt::query()
      ->with(['student', 'office', 'instructor', 'supervisor'])
      ->findOrFail($request->integer(EvaluationField::STUDENT_OJT_ID->value));
    Gate::authorize('view', $studentOjt);
    $evaluationDetail = $this->detail($studentOjt, 'supervisor', null);
    return view('shared.evaluations.create', compact('studentOjt', 'evaluationDetail'));
  }

  public function store(Request $request, ?StudentOjt $studentOjt = null): RedirectResponse {
    $studentOjt ??= StudentOjt::query()->findOrFail($request->integer(EvaluationField::STUDENT_OJT_ID->value));
    return $this->saveDetail($request, $studentOjt, 'supervisor', null);
  }

  public function update(Request $request, StudentOjt $studentOjt): RedirectResponse {
    return $this->saveDetail($request, $studentOjt, 'supervisor', null, $this->detail($studentOjt, 'supervisor', null));
  }

  public function detailCreate(StudentOjt $studentOjt, string $period): View|RedirectResponse {
    abort_unless(in_array($period, ['midterm', 'final'], true), 404);
    Gate::authorize('view', $studentOjt);
    $evaluationDetail = $this->detail($studentOjt, 'instructor', $period);
    if ($evaluationDetail?->exists && $evaluationDetail->status !== EvaluationStatus::DRAFT)
      return redirect()->route('web.' . Auth::user()->role->value . '.evaluations.detail.show', [$studentOjt, $evaluationDetail]);
    return view('shared.evaluations.edit', compact('studentOjt', 'evaluationDetail'));
  }

  public function detailStore(Request $request, StudentOjt $studentOjt, string $period): RedirectResponse {
    return $this->saveDetail($request, $studentOjt, 'instructor', $period);
  }

  public function detailUpdate(Request $request, StudentOjt $studentOjt, EvaluationDetail $evaluationDetail): RedirectResponse {
    $this->assertDetail($studentOjt, $evaluationDetail);
    $isAdmin = Auth::user()->isAdmin() || Auth::user()->isSuperAdmin();
    abort_if($evaluationDetail->evaluation_type !== 'instructor' && !$isAdmin, 403);
    abort_if($evaluationDetail->status !== EvaluationStatus::DRAFT && !$isAdmin, 403);
    return $this->saveDetail($request, $studentOjt, $evaluationDetail->evaluation_type, $evaluationDetail->period, $evaluationDetail);
  }

  private function saveDetail(Request $request, StudentOjt $studentOjt, string $type, ?string $period, ?EvaluationDetail $detail = null): RedirectResponse {
    Gate::authorize('view', $studentOjt);
    abort_if($type === 'supervisor' && !Auth::user()->isAdmin() && !Auth::user()->isSuperAdmin(), 403);
    abort_if($detail && $detail->status !== EvaluationStatus::DRAFT && !(Auth::user()->isAdmin() || Auth::user()->isSuperAdmin()), 403);
    if ((Auth::user()->isAdmin() || Auth::user()->isSuperAdmin()) && $request->has(EvaluationField::EVALUATION_TYPE->value)) {
      $type = $request->validate([EvaluationField::EVALUATION_TYPE->value => ['required', 'in:supervisor,instructor']])[EvaluationField::EVALUATION_TYPE->value];
      $period = $request->input(EvaluationField::PERIOD->value) ?: null;
      abort_unless(($type === 'supervisor' && $period === null) || ($type === 'instructor' && in_array($period, ['midterm', 'final'], true)), 422, 'Invalid evaluation type and period combination.');
      if ($detail?->evaluation && $detail->evaluation->details()->where('id', '!=', $detail->id)->where('evaluation_type', $type)->where('period', $period)->exists()) abort(422, 'That evaluation type and period already exists.');
    }
    $data = $this->validated($request);
    $evaluation = $studentOjt->evaluation()->firstOrCreate([]);
    $detail ??= $evaluation->details()->firstOrNew(['evaluation_type' => $type, 'period' => $period]);
    $detail->evaluator_id = $type === 'supervisor' ? $studentOjt->supervisor?->id : Auth::id();
    abort_if(!$detail->evaluator_id, 422, 'An evaluator is not assigned to this OJT.');
    $detail->fill(['evaluation_type' => $type, 'period' => $period, 'criteria_scores' => $data['criteria_scores'], 'remarks' => $data['remarks'] ?? null, 'total_points' => array_sum($data['criteria_scores']), 'status' => $data['status'], 'submitted_at' => in_array($data['status'], ['submitted', 'finalized'], true) ? ($detail->submitted_at ?? now()) : null])->save();
    return redirect()->route('web.' . Auth::user()->role->value . '.evaluations.detail.show', [$studentOjt, $detail])->with('success', 'Evaluation saved successfully.');
  }

  private function validated(Request $request): array {
    $rules = [
      EvaluationField::REMARKS->value => ['nullable', 'string'],
      EvaluationField::STATUS->value => ['required', 'in:draft,submitted,finalized'],
    ];
    foreach (EvaluationCriteria::get() as $criterion)
      $rules['score_' . $criterion['key']] = ['required', 'integer', 'min:0', 'max:' . $criterion['points']];
    $data = $request->validate($rules);
    $data['criteria_scores'] = collect(EvaluationCriteria::get())->mapWithKeys(fn($c) => [$c['key'] => (int) $data['score_' . $c['key']]])->all();
    return $data;
  }

  private function detail(StudentOjt $studentOjt, string $type, ?string $period): ?EvaluationDetail {
    return $studentOjt->evaluation?->details()->where('evaluation_type', $type)->where('period', $period)->first();
  }
  private function assertDetail(StudentOjt $studentOjt, EvaluationDetail $detail): void {
    abort_unless($detail->evaluation?->student_ojt_id === $studentOjt->id, 404);
  }
  private function authorizeAdmin(): void {
    abort_unless(Auth::user()->isAdmin() || Auth::user()->isSuperAdmin(), 403);
  }
}
