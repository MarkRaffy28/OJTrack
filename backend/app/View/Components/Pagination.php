<?php

namespace App\View\Components;

use Closure;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Contracts\View\View;
use App\View\Components\BaseComponent;

class Pagination extends BaseComponent {
  /**
   * Create a new component instance.
   */
  public function __construct(
    public LengthAwarePaginator $paginator
  ) {
  }

  /**
   * Get the view / contents that represent the component.
   */
  public function render(): View|Closure|string {
    return view('components.pagination');
  }
}
