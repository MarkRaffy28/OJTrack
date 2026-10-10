<?php

namespace App\Http\Controllers\Web\Admin;

use App\Enums\ActivityAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\Admin\EvaluationCriteriaRequest;
use App\Models\EvaluationCriteriaConfig;
use App\Services\ActivityService;
use App\Support\EvaluationCriteria;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Auth;

class EvaluationCriteriaController extends Controller {
  public function edit(): View {
    $criteria = EvaluationCriteriaConfig::query()->first();
    return view('admin.settings.evaluation-criterias', [
      'criteria' => $criteria?->criteria ?? EvaluationCriteria::defaults(),
    ]);
  }

  public function update(EvaluationCriteriaRequest $request, ActivityService $activityService) {
    $config = EvaluationCriteriaConfig::query()->updateOrCreate(
      ['id' => 1], ['criteria' => $request->validated('criteria')],
    );

    $activityService->log(Auth::user(), ActivityAction::EVALUATION_CRITERIA_UPDATED, $config);

    return redirect()->route('web.admin.settings.evaluation-criterias.edit')->with('success', 'Evaluation criteria updated successfully.');
  }
}
