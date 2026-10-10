<?php

namespace App\View\Components;

use Closure;
use Illuminate\Contracts\View\View;

class EmptyState extends BaseComponent {
  /**
   * Create a new component instance.
   */
  public function __construct(
    public string $title = 'No records found',
    public ?string $description = null,
    public string $icon = 'inbox',
  ) {
  }

  /**
   * Get the view / contents that represent the component.
   */
  public function render(): View|Closure|string {
    return view('components.empty-state');
  }
}
