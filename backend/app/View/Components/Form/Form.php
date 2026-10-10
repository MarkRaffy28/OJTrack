<?php

namespace App\View\Components\Form;

use Closure;
use Illuminate\Contracts\View\View;
use App\View\Components\BaseComponent;

class Form extends BaseComponent {
  /**
   * Create a new component instance.
   */
  public function __construct(
    public string $method = "POST",
    public ?string $action = null,
  ) {}

  /**
   * Get the view / contents that represent the component.
   */
  public function render(): View|Closure|string {
    return view('components.form.form');
  }
}
