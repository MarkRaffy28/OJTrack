<?php

namespace App\View\Components\Form;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class Input extends Component {
  public function __construct(
    public string $id = "",
    public string $name = "",
    public string $label = "",
    public string $type = "text",
    public string $icon = "",
    public bool $secure = false,
    public bool $required = false,
    public bool $disabled = false,
    public bool $readonly = false,
    public ?string $value = null,
    public ?int $max = null,
  ) {
  }

  public function render(): View|Closure|string {
    return view("components.form.input");
  }
}