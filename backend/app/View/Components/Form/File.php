<?php

namespace App\View\Components\Form;

use Closure;
use Illuminate\Contracts\View\View;
use App\View\Components\BaseComponent;

class File extends BaseComponent {
  public function __construct(
    public string $id = "",
    public string $name = "",
    public string $label = "",
    public string $icon = "",
    public array $value = [],
    public bool $required = false,
    public bool $disabled = false,
    public bool $readonly = false,
    public int $maxFiles = 1,
    public ?string $accept = null,
  ) {
  }

  public function render(): View|Closure|string {
    return view("components.form.file");
  }
}
