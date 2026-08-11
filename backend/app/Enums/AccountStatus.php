<?php

namespace App\Enums;

enum AccountStatus: string {
  case PRE_ACTIVATED = 'pre_activated';
  case ACTIVE = 'active';
  case SUSPENDED = 'suspended';
}