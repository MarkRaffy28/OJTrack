<?php

namespace App\Http\Requests\Web;

use App\Enums\OjtTerm;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OjtRequest extends FormRequest {
  public function authorize(): bool {
    return true;
  }

  public function rules(): array {
    $ojt = $this->route('ojt');

    return [
      'academic_year' => [
        'required', 'string', 'max:20',
        Rule::unique('ojts', 'academic_year')
          ->where(fn ($query) => $query->where('term', $this->input('term')))
          ->ignore($ojt?->id),
      ],
      'term' => ['required', Rule::enum(OjtTerm::class)],
      'start_date' => ['required', 'date'],
      'end_date' => ['required', 'date', 'after_or_equal:start_date'],
    ];
  }
}
