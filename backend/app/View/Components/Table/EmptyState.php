<?php

namespace App\View\Components\Table;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class EmptyState extends Component {
  /**
   * Create a new component instance.
   */
  public function __construct(
    public string $message = "Np records found.",
    public int $colspan = 1,
  ) {
  }

  /**
   * Get the view / contents that represent the component.
   */
  public function render(): View|Closure|string {
    return view('components.table.empty-state');
  }
}
