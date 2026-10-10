<?php

namespace App\Enums;

enum ActivityAction: string {
  // Authentication & Account
  case USER_REGISTERED = 'user_registered';
  case USER_LOGGED_IN = 'user_logged_in';
  case USER_LOGGED_OUT = 'user_logged_out';
  case USER_ACTIVATED = 'user_activated';
  case USER_SUSPENDED = 'user_suspended';
  case USER_PASSWORD_RESET = 'user_password_reset';

  // Database Backups
  case BACKUP_CREATED = 'backup_created';
  case BACKUP_RESTORED = 'backup_restored';

  // User Management & Profile
  case USER_CREATED = 'user_created';
  case USER_UPDATED = 'user_updated';
  case USER_DELETED = 'user_deleted';
  case USER_RESTORED = 'user_restored';
  case USER_FORCE_DELETED = 'user_force_deleted';
  case EMERGENCY_CONTACT_SAVED = 'emergency_contact_saved';

  // Office Management
  case OFFICE_CREATED = 'office_created';
  case OFFICE_UPDATED = 'office_updated';
  case OFFICE_DELETED = 'office_deleted';
  case OFFICE_RESTORED = 'office_restored';
  case OFFICE_FORCE_DELETED = 'office_force_deleted';

  // OJT Term Configuration
  case OJT_TERM_CREATED = 'ojt_term_created';
  case OJT_TERM_UPDATED = 'ojt_term_updated';
  case OJT_TERM_DELETED = 'ojt_term_deleted';

  // Student OJT Placements
  case OJT_ENROLLED = 'ojt_enrolled';
  case OJT_STATUS_CHANGED = 'ojt_status_changed';
  case OJT_INSTRUCTOR_ASSIGNED = 'ojt_instructor_assigned';
  case OJT_OFFICE_ASSIGNED = 'ojt_office_assigned';
  case OJT_DELETED = 'ojt_deleted';
  case OJT_RESTORED = 'ojt_restored';
  case OJT_FORCE_DELETED = 'ojt_force_deleted';

  // Daily Attendance
  case ATTENDANCE_TIMED_IN = 'attendance_timed_in';
  case ATTENDANCE_TIMED_OUT = 'attendance_timed_out';
  case ATTENDANCE_VERIFIED = 'attendance_verified';
  case ATTENDANCE_REJECTED = 'attendance_rejected';

  // Student Reports
  case REPORT_SUBMITTED = 'report_submitted';
  case REPORT_APPROVED = 'report_approved';
  case REPORT_REJECTED = 'report_rejected';
  case REPORT_DELETED = 'report_deleted';
  case REPORT_RESTORED = 'report_restored';
  case REPORT_FORCE_DELETED = 'report_force_deleted';

  // Student Evaluations
  case EVALUATION_CREATED = 'evaluation_created';
  case EVALUATION_SUBMITTED = 'evaluation_submitted';
  case EVALUATION_UPDATED = 'evaluation_updated';
  case EVALUATION_CRITERIA_UPDATED = 'evaluation_criteria_updated';

  // System Settings
  case SETTING_UPDATED = 'setting_updated';

  /**
   * Get a user-friendly label for UI logging displays.
   */
  public function description(): string {
    return match ($this) {
      self::USER_REGISTERED => 'User Registered',
      self::USER_LOGGED_IN => 'User Logged In',
      self::USER_LOGGED_OUT => 'User Logged Out',
      self::USER_ACTIVATED => 'User Account Activated',
      self::USER_SUSPENDED => 'User Account Suspended',
      self::USER_PASSWORD_RESET => 'User Password Reset',

      self::BACKUP_CREATED => 'Database Backup Created',
      self::BACKUP_RESTORED => 'Database Backup Restored',

      self::USER_CREATED => 'User Created',
      self::USER_UPDATED => 'User Updated',
      self::USER_DELETED => 'User Soft-Deleted',
      self::USER_RESTORED => 'User Restored',
      self::USER_FORCE_DELETED => 'User Permanently Deleted',
      self::EMERGENCY_CONTACT_SAVED => 'Emergency Contact Saved',

      self::OFFICE_CREATED => 'Office Created',
      self::OFFICE_UPDATED => 'Office Updated',
      self::OFFICE_DELETED => 'Office Soft-Deleted',
      self::OFFICE_RESTORED => 'Office Restored',
      self::OFFICE_FORCE_DELETED => 'Office Permanently Deleted',

      self::OJT_TERM_CREATED => 'OJT Term Created',
      self::OJT_TERM_UPDATED => 'OJT Term Updated',
      self::OJT_TERM_DELETED => 'OJT Term Deleted',

      self::OJT_ENROLLED => 'Student Enrolled in OJT',
      self::OJT_STATUS_CHANGED => 'OJT Status Updated',
      self::OJT_INSTRUCTOR_ASSIGNED => 'Instructor Assigned to OJT',
      self::OJT_OFFICE_ASSIGNED => 'Office Assigned to OJT',
      self::OJT_DELETED => 'Student OJT Soft-Deleted',
      self::OJT_RESTORED => 'Student OJT Restored',
      self::OJT_FORCE_DELETED => 'Student OJT Permanently Deleted',

      self::ATTENDANCE_TIMED_IN => 'Attendance Time-In Logged',
      self::ATTENDANCE_TIMED_OUT => 'Attendance Time-Out Logged',
      self::ATTENDANCE_VERIFIED => 'Attendance Verified',
      self::ATTENDANCE_REJECTED => 'Attendance Rejected',

      self::REPORT_SUBMITTED => 'Report Submitted',
      self::REPORT_APPROVED => 'Report Approved',
      self::REPORT_REJECTED => 'Report Rejected',
      self::REPORT_DELETED => 'Report Soft-Deleted',
      self::REPORT_RESTORED => 'Report Restored',
      self::REPORT_FORCE_DELETED => 'Report Permanently Deleted',

      self::EVALUATION_CREATED => 'Evaluation Drafted',
      self::EVALUATION_SUBMITTED => 'Evaluation Submitted',
      self::EVALUATION_UPDATED => 'Evaluation Updated',
      self::EVALUATION_CRITERIA_UPDATED => 'Evaluation Criteria Defaults Updated',

      self::SETTING_UPDATED => 'System Setting Updated',
    };
  }
}
