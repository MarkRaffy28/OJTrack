<?php

namespace App\Enums\Fields;

enum AssignmentField: string {
  case STUDENT_ID = 'student_id';
  case SUPERVISOR_ID = 'supervisor_id';
  case OFFICE_ID = 'office_id';
  case ACADEMIC_YEAR = 'academic_year';
  case TERM = 'term';
  case REQUIRED_HOURS = 'required_hours';
  case STATUS = 'status';
  case START_DATE = 'start_date';
  case END_DATE = 'end_date';
}