<?php

namespace App\View\Components\UI;

use Closure;
use Illuminate\Contracts\View\View;
use App\View\Components\BaseComponent;

class DeleteDialog extends BaseComponent {
  public function __construct(
    public ?string $action = null,
    public string $item = 'this item',
    public string $title = 'Confirm Delete',
    public string $cancelLabel = 'Cancel',
    public string $deleteLabel = 'Delete',
  ) {
  }

  public function render(): View|Closure|string {
    return view('components.u-i.delete-dialog');
  }
}
