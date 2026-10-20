<?php

namespace App\Http\Requests\Web\Admin;

use App\Support\EvaluationCriteria;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class EvaluationCriteriaRequest extends FormRequest {
  public function authorize(): bool { return true; }

  protected function prepareForValidation(): void {
    $criteria = collect($this->input('criteria', []))->map(function (array $criterion): array {
      $criterion['points'] = (int) ($criterion['points'] ?? 0);
      $criterion['key'] = Str::camel(preg_replace('/[^A-Za-z0-9]+/', ' ', trim((string) ($criterion['label'] ?? ''))));
      return $criterion;
    })->all();
    $this->merge(['criteria' => $criteria]);
  }

  public function rules(): array {
    return ['criteria' => ['required', 'array', 'min:1', function (string $attribute, mixed $value, \Closure $fail): void {
      if (!EvaluationCriteria::isValid($value)) {
        $fail('Criteria must be valid JSON and their points must total exactly 100.');
      }
    }],
      'criteria.*.key' => ['required', 'string', 'regex:/^[A-Za-z][A-Za-z0-9]*$/', 'distinct'],
      'criteria.*.label' => ['required', 'string', 'max:100'],
      'criteria.*.description' => ['required', 'string', 'max:500'],
      'criteria.*.points' => ['required', 'integer', 'min:1'],
    ];
  }
}
