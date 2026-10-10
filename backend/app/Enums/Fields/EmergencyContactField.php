<?php

namespace App\Enums\Fields;

enum EmergencyContactField: string {
  case NAME = 'name';
  case RELATIONSHIP = 'relationship';
  case CONTACT_NUMBER = 'contact_number';
  case ADDRESS = 'address';
}
