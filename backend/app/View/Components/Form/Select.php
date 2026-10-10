<?php

namespace App\View\Components\Form;

use Closure;
use Illuminate\Contracts\View\View;
use App\View\Components\BaseComponent;

class Select extends BaseComponent {
  /**
   * Create a new component instance.
   */
  public function __construct(
    public string $id = "",
    public string $name = "",
    public string $label = "",
    public string $icon = "",
    public array $options = [],
    public mixed $value = null,
    public string $placeholder = "Select an option",
    public bool $required = false,
    public bool $disabled = false,
    public bool $readonly = false,
    public bool $searchable = false,
) {}

  /**
   * Get the view / contents that represent the component.
   */
  public function render(): View|Closure|string {
    return view('components.form.select');
  }
}
