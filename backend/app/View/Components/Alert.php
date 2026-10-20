<?php

namespace App\View\Components;

use Closure;
use Illuminate\Contracts\View\View;
use App\View\Components\BaseComponent;

class Alert extends BaseComponent {
  /**
   * Create a new component instance.
   */
  public function __construct(
    public string $type = "success",
    public ?string $title = null,
    public ?int $duration = 5000,
  ) {
  }

  /**
   * Get the view / contents that represent the component.
   */
  public function render(): View|Closure|string {
    return view('components.alert');
  }
}
