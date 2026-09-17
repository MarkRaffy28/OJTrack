<?php

namespace App\Enums\Fields;

enum ReportField: string {
  case STUDENT_ID = 'student_id';
  case OJT_ID = 'ojt_id';
  case TYPE = 'type';
  case REPORT_DATE = 'report_date';
  case DOCUMENT_PATHS = 'document_paths';
  case STATUS = 'status';
  case REVIEWED_BY = 'reviewed_by';
  case REVIEWED_AT = 'reviewed_at';
  case FEEDBACK = 'feedback';
}