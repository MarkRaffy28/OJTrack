<?php

namespace App\View\Components\Table;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\View\Components\BaseComponent;

class Actions extends BaseComponent {
  public array $routes = [];
  public string $deleteTitle;
  public string $deleteLabel;
  public ?string $evaluationRoute;
  public ?string $evaluationLabel;
  public string $role;
  public ?string $viewRoute;
  public ?string $editRoute;
  public ?string $deleteRoute;
  public ?string $restoreRoute;

  public function __construct(
    public mixed $model,
    public array $actions = ['view', 'edit', 'delete'],
    public string $routePrefix = '',
    string $deleteTitle = '',
    string $deleteLabel = '',
    ?string $evaluationRoute = null,
    ?string $evaluationLabel = null,
    ?string $viewRoute = null,
    ?string $editRoute = null,
    ?string $deleteRoute = null,
    ?string $restoreRoute = null,
  ) {
    $this->role = Auth::user()->role->value ?? 'admin';
    $this->deleteTitle = $deleteTitle ?: "Delete " . class_basename($model) . "?";
    $this->deleteLabel = $deleteLabel ?: 'this item';

    $this->evaluationRoute = $evaluationRoute;
    $this->evaluationLabel = $evaluationLabel;
    $this->viewRoute = $viewRoute;
    $this->editRoute = $editRoute;
    $this->deleteRoute = $deleteRoute;
    $this->restoreRoute = $restoreRoute;

    $this->actions = $this->allowedActions($this->actions);

    $this->generateRoutes();
  }

  private function generateRoutes(): void {
    $resource = $this->routePrefix ?: Str::kebab(class_basename($this->model)) . 's';
    $prefix = "web.{$this->role}.{$resource}";

    $routeMap = [
      'view'   => fn() => $this->viewRoute ?: route("{$prefix}.show", $this->model),
      'edit'   => fn() => $this->editRoute ?: route("{$prefix}.edit", $this->model),
      'delete' => fn() => $this->deleteRoute ?: route("{$prefix}.destroy", $this->model),
      'restore' => fn() => $this->restoreRoute ?: route("{$prefix}.restore", $this->model),
      'evaluation' => fn() => $this->evaluationRoute,
    ];

    foreach ($this->actions as $action) {
      if (isset($routeMap[$action])) {
        $this->routes[$action] = ($routeMap[$action])();
      }
    }
  }

  private function allowedActions(array $actions): array {
    $policy = Gate::getPolicyFor($this->model);
    $isSoftDeleted = in_array(SoftDeletes::class, class_uses_recursive($this->model), true)
      && method_exists($this->model, 'trashed')
      && $this->model->trashed();

    if ($isSoftDeleted) {
      $actions = [];

      if (Gate::allows('view', $this->model)) {
        $actions[] = 'view';
      }

      if (Gate::allows('restore', $this->model)) {
        $actions[] = 'restore';
      }

      return $actions;
    }

    $actions = array_values(array_filter($actions, fn(string $action) => $action !== 'restore'));

    if (!$policy) {
      return $actions;
    }

    return array_values(array_filter($actions, function (string $action): bool {
      $ability = match ($action) {
        'edit' => 'update',
        default => $action,
      };

      return Gate::allows($ability, $this->model);
    }));
  }

  public function render(): View|Closure|string {
    return view('components.table.actions');
  }
}
