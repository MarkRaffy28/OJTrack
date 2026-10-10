<?php

namespace App\View\Components\Table;

use App\View\Components\BaseComponent;
use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Str;

class Row extends BaseComponent {
  public string $href;

  public function __construct(
    public mixed $model,
    public string $routePrefix = '',
  ) {
    $this->generateRoute();
  }

  private function generateRoute(): void {
    $resource = $this->routePrefix ?: Str::kebab(class_basename($this->model)) . 's';
    $prefix = "web.{$this->currentRole->value}.{$resource}";

    $this->href = route("{$prefix}.show", $this->model);
  }
  public function render(): View|Closure|string {
    return view('components.table.row');
  }
}
