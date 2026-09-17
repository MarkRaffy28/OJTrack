<?php

namespace App\Enums\Fields;

enum StudentOjtField: string {
  case ACADEMIC_YEAR = 'academic_year';
  case TERM = 'term';
  case REQUIRED_HOURS = 'required_hours';
  case STATUS = 'status';
  case START_DATE = 'start_date';
  case END_DATE = 'end_date';
}