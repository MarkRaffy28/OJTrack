<?php

namespace App\View\Components\Table;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\View\Components\BaseComponent;

class Actions extends BaseComponent {
  public array $routes = [];
  public string $deleteTitle;
  public string $deleteLabel;
  public ?string $evaluationRoute;
  public ?string $evaluationLabel;
  public string $role;

  public function __construct(
    public mixed $model,
    public array $actions = ['view', 'edit', 'delete'],
    public string $routePrefix = '',
    string $deleteTitle = '',
    string $deleteLabel = '',
    ?string $evaluationRoute = null,
    ?string $evaluationLabel = null,
  ) {
    $this->role = Auth::user()->role->value ?? 'admin';
    $this->deleteTitle = $deleteTitle ?: "Delete " . class_basename($model) . "?";
    $this->deleteLabel = $deleteLabel ?: 'this item';

    $this->evaluationRoute = $evaluationRoute;
    $this->evaluationLabel = $evaluationLabel;

    $this->generateRoutes();
  }

  private function generateRoutes(): void {
    $resource = $this->routePrefix ?: Str::kebab(class_basename($this->model)) . 's';
    $prefix = "web.{$this->role}.{$resource}";

    $routeMap = [
      'view'   => fn() => route("{$prefix}.show", $this->model),
      'edit'   => fn() => route("{$prefix}.edit", $this->model),
      'delete' => fn() => route("{$prefix}.destroy", $this->model),
      'evaluation' => fn() => $this->evaluationRoute,
    ];

    foreach ($this->actions as $action) {
      if (isset($routeMap[$action])) {
        $this->routes[$action] = ($routeMap[$action])();
      }
    }
  }

  public function render(): View|Closure|string {
    return view('components.table.actions');
  }
}
