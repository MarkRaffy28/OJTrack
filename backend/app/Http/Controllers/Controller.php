<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

abstract class Controller {
  public ?UserRole $viewer;

  public function __construct() {
    $this->viewer = Auth::user()->role;
  }

  /**
   * Restrict a query to the cohort selected in the web session.
   *
   * The relation is configurable because index queries use different models:
   * most point directly to Ojt, while evaluations point through StudentOjt.
   */
  protected function selectedCohortQuery(Builder $query, string $relation = 'ojt'): Builder {
    $cohort = session('selected_cohort');

    return $query->when(
      is_array($cohort) && isset($cohort['academic_year'], $cohort['term']),
      fn (Builder $query) => $query->whereHas($relation, fn (Builder $ojt) => $ojt
        ->where('academic_year', $cohort['academic_year'])
        ->where('term', $cohort['term']))
    );
  }
}
