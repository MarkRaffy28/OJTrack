<?php

namespace App\Http\Controllers\Web\Admin;

use App\Enums\ActivityAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Web\Admin\SettingRequest;
use App\Models\Setting;
use App\Enums\SettingKey;
use App\Services\ActivityService;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Auth;

class SettingController extends Controller {
  public function index(): View {
    $settings = Setting::query()
      ->where('setting_key', '!=', SettingKey::EVALUATION_CRITERIA->value)
      ->orderBy('id')
      ->get()
      ->keyBy('setting_key');

    return view('admin.settings.index', compact('settings'));
  }

  public function edit(): View {
    $settings = Setting::query()
      ->where('setting_key', '!=', SettingKey::EVALUATION_CRITERIA->value)
      ->orderBy('id')
      ->get()
      ->keyBy('setting_key');

    return view('admin.settings.edit', compact('settings'));
  }

  public function update(SettingRequest $request, ActivityService $activityService) {
    foreach ($request->validated('settings') as $key => $value) {
      Setting::where('setting_key', $key)->update([
        'setting_value' => $value,
      ]);
    }

    $activityService->log(Auth::user(), ActivityAction::SETTING_UPDATED);

    return redirect()
      ->route("web.admin.settings.index")
      ->with('success', 'Settings updated successfully.');
  }
}
