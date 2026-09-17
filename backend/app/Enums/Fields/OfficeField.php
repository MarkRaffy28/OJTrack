<?php

namespace App\Enums\Fields;

enum OfficeField: string {
  case NAME = 'name';
  case ADDRESS = 'address';
  case CONTACT_EMAIL = 'contact_email';
  case CONTACT_PHONE = 'contact_phone';
  case MORNING_IN = 'morning_in';
  case MORNING_OUT = 'morning_out';
  case AFTERNOON_IN = 'afternoon_in';
  case AFTERNOON_OUT = 'afternoon_out';
}