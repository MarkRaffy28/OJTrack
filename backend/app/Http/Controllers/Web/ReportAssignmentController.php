<?php

namespace App\Http\Controllers\Web;

use App\Enums\ReportType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\ReportAssignmentRequest;
use App\Models\Ojt;
use App\Models\ReportAssignment;
use App\Models\User;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

class ReportAssignmentController extends Controller {
  public function index(Request $request): View {
    Gate::authorize('viewAny', ReportAssignment::class);

    $viewer = Auth::user();

    $request->validate([
      'ojt_id' => ['sometimes', 'nullable', 'integer', 'exists:student_ojts,id'],
      'created_by' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
      'type' => ['sometimes', 'nullable', 'string'],
      'title' => ['sometimes', 'nullable', 'string'],
      'is_published' => ['sometimes', 'nullable', 'boolean'],
    ]);

    $query = ReportAssignment::query()
      ->withTrashed()
      ->with([
        'ojt.student',
        'ojt.office',
        'ojt.ojt',
        'creator',
      ])
      ->filter($request->only([
        'ojt_id',
        'created_by',
        'type',
        'title',
        'is_published',
      ]))
      ->sort(
        $request->input('sort', 'id'),
        $request->input('direction', 'desc')
      );

    $creators = User::query()
      ->whereIn('id', ReportAssignment::select('created_by')->whereNotNull('created_by')->distinct())
      ->visibleTo($viewer)
      ->orderBy('last_name')
      ->get();

    $headers = [
      ['label' => 'ID', 'key' => 'id'],
      ['label' => 'Title', 'key' => 'title'],
      ['label' => 'Type', 'key' => 'type'],
      ['label' => 'Due Date', 'key' => 'due_at'],
      ['label' => 'Published Date', 'key' => 'published_at'],
      ['label' => 'Created By', 'key' => 'creator'],
      'Actions',
    ];

    $filters = [
      [
        'name' => 'type',
        'label' => 'Type',
        'options' => ReportType::options(),
      ],
      [
        'name' => 'created_by',
        'label' => 'Created By',
        'options' => $creators->map(fn($user) => [
          'value' => $user->id,
          'label' => $user->full_name,
        ])->toArray(),
        'searchable' => true,
      ],
      [
        'name' => 'is_published',
        'label' => 'Status',
        'options' => [
          ['value' => '1', 'label' => 'Published'],
          ['value' => '0', 'label' => 'Draft / Scheduled'],
        ],
      ],
    ];

    $assignments = $query
      ->paginate(10)
      ->withQueryString();

    return view('shared.report-assignments.index', [
      'assignments' => $assignments,
      'headers' => $headers,
      'filters' => $filters,
    ]);
  }

  public function create(): View {
    Gate::authorize('create', ReportAssignment::class);

    return view('shared.report-assignments.create', $this->formData());
  }

  public function edit(ReportAssignment $reportAssignment): View {
    Gate::authorize('update', $reportAssignment);

    return view('shared.report-assignments.edit', [
      ...$this->formData(),
      'assignment' => $reportAssignment,
    ]);
  }

  public function store(ReportAssignmentRequest $request) {
    Gate::authorize('create', ReportAssignment::class);

    ReportAssignment::create([
      ...$request->validated(),
      'created_by' => Auth::id(),
      'published_at' => now(),
      'allow_late_submission' => $request->boolean('allow_late_submission'),
    ]);

    return redirect()->route('web.' . Auth::user()->role->value . '.report-assignments.index')
      ->with('success', 'Report assignment published successfully.');
  }

  public function show(ReportAssignment $reportAssignment): View {
    Gate::authorize('view', $reportAssignment);

    $reportAssignment->load(['ojt.student', 'ojt.office', 'creator', 'reports']);

    return view("shared.report-assignments.show", compact("reportAssignment"));
  }

  public function update(ReportAssignmentRequest $request, ReportAssignment $reportAssignment) {
    Gate::authorize('update', $reportAssignment);
    $reportAssignment->update([
      ...$request->validated(),
      'allow_late_submission' => $request->boolean('allow_late_submission'),
    ]);

    return back()->with('success', 'Report assignment updated successfully.');
  }

  public function destroy(ReportAssignment $reportAssignment) {
    Gate::authorize('delete', $reportAssignment);

    $reportAssignment->delete();

    return back()->with('success', 'Report assignment deleted successfully.');
  }

  public function restore(ReportAssignment $reportAssignment) {
    Gate::authorize('restore', $reportAssignment);
    $reportAssignment->restore();

    return back()->with('success', 'Report assignment restored successfully.');
  }

  private function formData(): array {
    return [
      'ojts' => Ojt::query()->orderByDesc('academic_year')->orderByDesc('term')->get(),
      'types' => ReportType::options(),
    ];
  }
}
