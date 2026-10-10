<?php

namespace App\Enums\Fields;

enum SystemField: string {
  case ID = 'id';
  case CREATED_AT = 'created_at';
  case UPDATED_AT = 'updated_at';
  case DELETED_AT = 'deleted_at';
}
