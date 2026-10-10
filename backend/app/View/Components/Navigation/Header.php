<?php

namespace App\View\Components\Navigation;

use Closure;
use Illuminate\Contracts\View\View;
use App\View\Components\BaseComponent;

class Header extends BaseComponent {
  public ?string $printUrl = null;
  /**
   * Create a new component instance.
   */
  public function __construct(
    public string $title,
    public ?string $description = null,
    public bool $print = false,
    public bool $openPrintInNewTab = true,
    public ?string $createRoute = null,
    public ?string $createButtonText = "Create",
  ) {
    if ($this->print) {
      $this->printUrl = route(
        request()->route()->getName(),
        array_merge(request()->query(), ['print' => true])
      );
    }
  }

  /**
   * Get the view / contents that represent the component.
   */
  public function render(): View|Closure|string {
    return view('components.navigation.header');
  }
}
