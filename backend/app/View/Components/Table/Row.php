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
    public array $routeParameters = [],
    public ?string $rowHref = null,
  ) {
    $this->generateRoute();
  }

  private function generateRoute(): void {
    $resource = $this->routePrefix ?: Str::kebab(class_basename($this->model)) . 's';
    $prefix = "web.{$this->currentRole->value}.{$resource}";

    // Use the route's named model parameter. Passing the model positionally
    // can leave named placeholders such as {studentOjt} unresolved.
    $parameter = lcfirst(class_basename($this->model));
    $this->href = $this->rowHref ?: route("{$prefix}.show", $this->routeParameters ?: [$parameter => $this->model]);
  }
  public function render(): View|Closure|string {
    return view('components.table.row');
  }
}
