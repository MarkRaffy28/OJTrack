<?php

namespace App\View\Components\Table;

use Closure;
use Illuminate\Contracts\View\View;
use App\View\Components\BaseComponent;

class Table extends BaseComponent {
  /**
   * Create a new component instance.
   */
  public function __construct(
    public array $headers = [],
  ) {
  }

  /**
   * Get the view / contents that represent the component.
   */
  public function render(): View|Closure|string {
    return view('components.table.table');
  }
}
