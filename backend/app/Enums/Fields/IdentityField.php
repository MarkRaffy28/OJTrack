<?php

namespace App\Enums\Fields;

enum IdentityField: string {
  case USER_ID = 'user_id';
  case USERNAME = 'username';
  case FIRST_NAME = 'first_name';
  case MIDDLE_NAME = 'middle_name';
  case LAST_NAME = 'last_name';
  case EXTENSION_NAME = 'extension_name';
  case FULL_NAME = 'full_name';
}
