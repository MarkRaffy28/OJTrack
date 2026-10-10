<?php

namespace App\View\Components;

use Closure;
use Illuminate\Contracts\View\View;
use App\View\Components\BaseComponent;

class SearchFilter extends BaseComponent {
  public function __construct(
    public array $filters = [],
    public string $searchName = 'search',
    public string $dateRangeName = 'date_range',
    public string $searchPlaceholder = 'Search...',
    public bool $showSearch = true,
    public bool $showDateRange = false,
  ) {
  }

  public function searchValue(): string {
    return request($this->searchName, '');
  }

  public function filterValue(string $name): mixed {
    return request($name);
  }

  public function render(): View|Closure|string {
    return view('components.search-filter');
  }
}
