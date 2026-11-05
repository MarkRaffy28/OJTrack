<?php

namespace App\View\Components\Table;

use App\View\Components\BaseComponent;
use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Str;

class Cell extends BaseComponent {
  public string $alignmentClass;
  public ?string $href = null;

  public function __construct(
    public string $alignment = 'center',
    public ?string $class = null,
    public ?object $model = null,
  ) {
    $this->alignmentClass = match ($this->alignment) {
      'left' => 'justify-start',
      'right' => 'justify-end',
      default => 'justify-center',
    };

    $this->generateRoute();
  }

  private function generateRoute(): void {
    if (!$this->model) {
      return;
    }

    $resource = Str::kebab(class_basename($this->model)) . 's';
    $prefix = "{$this->currentRole->value}.{$resource}";

    $this->href = route("{$prefix}.show", $this->model);
  }

  public function render(): View|Closure|string {
    return view('components.table.cell');
  }
}
