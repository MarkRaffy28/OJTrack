<?php

namespace App\View\Components\Navigation;

use App\Models\Ojt;
use App\Models\Setting;
use App\Enums\OjtTerm;
use App\View\Components\BaseComponent;
use Closure;
use Illuminate\Contracts\View\View;

class Header extends BaseComponent {
  public ?string $printUrl = null;
  public array $cohortOptions = [];
  public array $academicYearOptions = [];
  public array $termOptions = [];
  public ?string $selectedAcademicYear = null;
  public ?string $selectedTerm = null;
  public ?string $selectedCohortValue = null;
  /**
   * Create a new component instance.
   */
  public function __construct(
    public string $title,
    public ?string $description = null,
    public bool $dashboard = false,
    public bool $print = false,
    public bool $openPrintInNewTab = true,
    public bool $showCohortSelector = false,
    public ?string $createRoute = null,
    public ?string $createButtonText = "Create",
     public ?string $editRoute = null,
    public ?string $editButtonText = "Edit",
    public bool $goBack = false,
  ) {
    if ($this->print) {
      $this->printUrl = route(
        request()->route()->getName(),
        array_merge(
          request()->route()->parameters(),
          request()->query(),
          ['print' => true],
        )
      );
    }

    if ($this->showCohortSelector) {
      $this->cohortOptions = Ojt::query()
        ->select('academic_year', 'term')
        ->distinct()
        ->orderByDesc('academic_year')
        ->orderBy('term')
        ->get()
        ->map(fn (Ojt $ojt) => [
          'value' => "{$ojt->academic_year} - {$ojt->term->value}",
          'label' => "A.Y. {$ojt->academic_year} - {$ojt->term->value}",
        ])
        ->values()
        ->toArray();

      $sessionCohort = session('selected_cohort');

      if (is_array($sessionCohort) && isset($sessionCohort['academic_year'], $sessionCohort['term'])) {
        $this->selectedAcademicYear = $sessionCohort['academic_year'];
        $this->selectedTerm = $sessionCohort['term'];
        $this->selectedCohortValue = "{$sessionCohort['academic_year']} - {$sessionCohort['term']}";
      }
    }
  }

  /**
   * Get the view / contents that represent the component.
   */
  public function render(): View|Closure|string {
    return view('components.navigation.header');
  }
}
