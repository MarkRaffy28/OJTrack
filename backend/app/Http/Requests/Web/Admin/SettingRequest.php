<?php

namespace App\Http\Requests\Web\Admin;

use App\Models\Setting;
use App\Rules\SettingRules;
use Illuminate\Foundation\Http\FormRequest;

class SettingRequest extends FormRequest {
  public function authorize(): bool {
    return true;
  }

  public function rules(): array {
    $rules = [];

    foreach (Setting::query()->get() as $setting) {
      $key = $setting->setting_key->value;

      $rules["settings.{$key}"] = SettingRules::settingValue($key);
    }

    return $rules;
  }
}