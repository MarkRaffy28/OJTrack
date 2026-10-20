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
use Illuminate\Support\Facades\Gate;
use Illuminate\Http\UploadedFile;

class SettingController extends Controller {
  public function index(): View {
    Gate::authorize('viewAny', Setting::class);

    $settings = Setting::query()
      ->where('setting_key', '!=', SettingKey::EVALUATION_CRITERIA->value)
      ->orderBy('id')
      ->get()
      ->keyBy('setting_key');

    $decodedAllowedAttendanceDates = json_decode(
      $settings->get(SettingKey::ALLOWED_ATTENDANCE_DATES->value)?->setting_value ?? '[]',
      true,
    );
    $allowedAttendanceDates = is_array($decodedAllowedAttendanceDates)
      ? $decodedAllowedAttendanceDates
      : [];

    return view('admin.settings.index', compact('settings', 'allowedAttendanceDates'));
  }

  public function edit(): View {
    Gate::authorize('update', Setting::class);

    $settings = Setting::query()
      ->where('setting_key', '!=', SettingKey::EVALUATION_CRITERIA->value)
      ->orderBy('id')
      ->get()
      ->keyBy('setting_key');
    $decodedAllowedAttendanceDates = json_decode(
      $settings->get(SettingKey::ALLOWED_ATTENDANCE_DATES->value)?->setting_value ?? '[]',
      true,
    );
    $allowedAttendanceDates = is_array($decodedAllowedAttendanceDates)
      ? $decodedAllowedAttendanceDates
      : [];

    return view('admin.settings.edit', compact('settings', 'allowedAttendanceDates'));
  }

  public function update(SettingRequest $request, ActivityService $activityService) {
    Gate::authorize('update', Setting::class);

    foreach ($request->validated('settings') as $key => $value) {
      if ($value instanceof UploadedFile) {
        $value = $value->store('report-templates', 'public');
      }
      if ($key === SettingKey::ALLOWED_ATTENDANCE_DATES->value) {
        $dates = json_decode((string) $value, true);
        sort($dates);
        $value = json_encode(array_values(array_unique($dates)), JSON_THROW_ON_ERROR);
      }
      if ($value === null) continue;

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
