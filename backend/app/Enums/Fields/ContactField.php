<?php

namespace App\Enums\Fields;

enum ContactField: string {
  case HOME_ADDRESS = 'home_address';
  case PRESENT_ADDRESS = 'present_address';
  case CONTACT_NUMBER = 'contact_number';
  case EMAIL = 'email';
}
