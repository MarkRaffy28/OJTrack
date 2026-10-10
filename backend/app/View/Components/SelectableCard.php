<?php

namespace App\View\Components;

use Closure;
use Illuminate\Contracts\View\View;

class SelectableCard extends BaseComponent {
  public function __construct(
    public string $icon,
    public string $title,
    public int $id,
    public string $param,
    public ?string $subtitle = null,
    public ?int $count = null,
    public ?string $countLabel = "record",
  ) {

  }

  public function render(): View|Closure|string {
    return view('components.selectable-card');
  }
}
