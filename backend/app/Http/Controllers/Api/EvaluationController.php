<?php

namespace App\Http\Controllers\Api;

use App\Enums\EvaluationStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\EvaluationResource;
use App\Models\Evaluation;
use App\Models\Setting;
use App\Models\StudentOjt;
use App\Support\EvaluationCriteria;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EvaluationController extends Controller {
  private const MAX_POINTS = [
    'quality' => 40,
    'productivity' => 20,
    'initiative' => 20,
    'timeManagementPunctuality' => 10,
    'properAttireGrooming' => 10,
  ];

  public function show(Request $request, int $ojtId): JsonResponse {
    $ojt = $this->accessibleOjt($request, $ojtId);
    $evaluation = $ojt->evaluation;
    $eligible = $this->isOpen($ojt);

    return response()->json([
      'evaluation' => $evaluation ? EvaluationResource::make($evaluation) : null,
      'eligible' => $eligible,
      'canEdit' => $eligible && (!$evaluation || $evaluation->status === EvaluationStatus::DRAFT),
      'triggerDays' => $this->triggerDays(),
      'evaluationOpen' => $this->isManuallyOpen(),
      'criteria' => EvaluationCriteria::get(),
    ]);
  }

  public function save(Request $request, int $ojtId): JsonResponse {
    $ojt = $this->accessibleOjt($request, $ojtId);
    $this->ensureSupervisor($request);
    if (!$this->isOpen($ojt)) {
      return response()->json(['message' => 'Evaluation is not open for this trainee yet.'], 422);
    }
    $evaluation = $this->findOrCreate($ojt);

    if ($evaluation->exists && $evaluation->status !== EvaluationStatus::DRAFT) {
      return response()->json(['message' => 'Only draft evaluations can be edited.'], 422);
    }

    $data = $this->validated($request);
    $evaluation->fill($this->attributes($data));
    $evaluation->status = EvaluationStatus::DRAFT;
    $evaluation->save();

    return response()->json(EvaluationResource::make($evaluation));
  }

  public function submit(Request $request, int $ojtId): JsonResponse {
    $ojt = $this->accessibleOjt($request, $ojtId);
    $this->ensureSupervisor($request);
    if (!$this->isOpen($ojt)) {
      return response()->json(['message' => 'Evaluation is not open for this trainee yet.'], 422);
    }

    $evaluation = $this->findOrCreate($ojt);
    if ($evaluation->exists && $evaluation->status !== EvaluationStatus::DRAFT) {
      return response()->json(['message' => 'Only draft evaluations can be submitted.'], 422);
    }

    $data = $this->validated($request);
    $evaluation->fill($this->attributes($data));
    $evaluation->status = EvaluationStatus::SUBMITTED;
    $evaluation->submitted_at = now();
    $evaluation->save();

    return response()->json(EvaluationResource::make($evaluation));
  }

  public function finalize(Request $request, int $ojtId): JsonResponse {
    $ojt = $this->accessibleOjt($request, $ojtId);
    $this->ensureSupervisor($request);
    $evaluation = $ojt->evaluation;
    if (!$evaluation || $evaluation->status !== EvaluationStatus::SUBMITTED) {
      return response()->json(['message' => 'Only submitted evaluations can be finalized.'], 422);
    }

    $evaluation->status = EvaluationStatus::FINALIZED;
    $evaluation->save();
    return response()->json(EvaluationResource::make($evaluation));
  }

  private function accessibleOjt(Request $request, int $ojtId): StudentOjt {
    $query = StudentOjt::with('evaluation')->whereKey($ojtId);
    $user = $request->user();
    if ($user->role === UserRole::SUPERVISOR) {
      $query->whereHas('supervisor', fn ($supervisor) => $supervisor->whereKey($user->id));
    } else {
      $query->where('student_id', $user->id);
    }

    $ojt = $query->first();
    abort_if(!$ojt, 404, 'OJT record not found.');
    return $ojt;
  }

  private function ensureSupervisor(Request $request): void {
    abort_if($request->user()->role !== UserRole::SUPERVISOR, 403, 'Only supervisors can manage evaluations.');
  }

  private function findOrCreate(StudentOjt $ojt): Evaluation {
    return $ojt->evaluation ?: new Evaluation(['student_ojt_id' => $ojt->id]);
  }

  private function validated(Request $request): array {
    $rules = ['remarks' => ['nullable', 'string']];
    foreach (EvaluationCriteria::get() as $criterion) {
      $rules[$criterion['key']] = ['required', 'integer', 'min:0', 'max:' . $criterion['points']];
    }
    return $request->validate($rules);
  }

  private function attributes(array $data): array {
    $scores = [];
    foreach (EvaluationCriteria::get() as $criterion) {
      $scores[$criterion['key']] = $data[$criterion['key']];
    }
    $attributes = [
      'criteria_scores' => $scores,
      'remarks' => $data['remarks'] ?? null,
    ];
    foreach ($scores as $key => $score) {
      $attributes[EvaluationCriteria::databaseKey($key)] = $score;
    }
    $attributes['total_points'] = array_sum($scores);
    return $attributes;
  }

  private function triggerDays(): int {
    return max(0, (int) (Setting::query()->where('setting_key', 'evaluation_trigger_days')->value('setting_value') ?? 0));
  }

  private function isManuallyOpen(): bool {
    return filter_var(Setting::query()->where('setting_key', 'evaluation_open')->value('setting_value'), FILTER_VALIDATE_BOOLEAN);
  }

  private function isOpen(StudentOjt $ojt): bool {
    if ($this->isManuallyOpen()) return true;
    if (!$ojt->end_date) return false;
    return Carbon::today()->greaterThanOrEqualTo($ojt->end_date->copy()->subDays($this->triggerDays()));
  }
}
