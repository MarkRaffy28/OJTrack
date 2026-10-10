<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use Illuminate\Support\Facades\Auth;

abstract class Controller {
  public ?UserRole $viewer;

  public function __construct() {
    $this->viewer = Auth::user()->role;
  }
}
