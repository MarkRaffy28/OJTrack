<?php

namespace App\View\Components;

use App\Enums\UserRole;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\Component;

abstract class BaseComponent extends Component {
  public function __get($name) {
    if ($name === 'currentRole') {
      return Auth::user()?->role;
    }

    return parent::__get($name);
  }
}