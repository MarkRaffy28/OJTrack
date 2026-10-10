<?php

namespace App\Enums\Fields;

enum AssignmentField: string {
  case STUDENT_ID = 'student_id';
  case OJT_ID = 'ojt_id';
  case OFFICE_ID = 'office_id';
  case REQUIRED_HOURS = 'required_hours';
  case STATUS = 'status';
}
