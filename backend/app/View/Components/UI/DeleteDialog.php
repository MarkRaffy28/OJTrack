<?php

namespace App\View\Components\UI;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class DeleteDialog extends Component {
  /**
   * Create a new component instance.
   */
  public function __construct(
    public string $item,
    public string $title = 'Delete',
    public string $cancelLabel = 'Cancel',
    public string $deleteLabel = 'Delete',
  ) {
  }

  /**
   * Get the view / contents that represent the component.
   */
  public function render(): View|Closure|string {
    return view('components.u-i.delete-dialog');
  }
}