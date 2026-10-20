<?php

namespace App\Enums\Fields;

enum PasswordField: string {
  case PASSWORD = 'password';
  case CURRENT_PASSWORD = 'current_password';
  case NEW_PASSWORD = 'new_password';
  case CONFIRM_PASSWORD = 'confirm_password';
}
