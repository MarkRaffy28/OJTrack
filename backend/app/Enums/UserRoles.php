<?php

namespace App\Enums;

enum UserRoles: string {
  case STUDENT = 'student';
  case SUPERVISOR = 'supervisor';
  case ADVISER = 'adviser';
  case ADMIN = 'admin';
}