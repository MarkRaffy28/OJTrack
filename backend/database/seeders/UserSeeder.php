<?php

namespace Database\Seeders;

use App\Models\InstructorDetail;
use App\Models\Office;
use App\Models\StudentDetail;
use App\Models\SupervisorDetail;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder {
  public function run(): void {
    // Admin
    User::create([
      'username' => 'admin',
      'password' => Hash::make('password'),
      'first_name' => 'System',
      'middle_name' => null,
      'last_name' => 'Administrator',
      'extension_name' => null,
      'user_id' => 'ADM-0001',
      'birth_date' => '1990-01-01',
      'gender' => 'Male',
      'address' => 'Sta. Maria, Ilocos Sur',
      'contact_number' => '09123456789',
      'email' => 'admin@ojtrack.test',
      'role' => 'admin',
    ]);

    // Student
    $student = User::create([
      'username' => 'student',
      'password' => Hash::make('password'),

      'first_name' => 'Juan',
      'middle_name' => null,
      'last_name' => 'Dela Cruz',
      'extension_name' => null,

      'user_id' => 'STU-0001',

      'birth_date' => '2004-05-10',
      'gender' => 'Male',

      'address' => 'Sta. Maria, Ilocos Sur',
      'contact_number' => '09123456789',

      'email' => 'student@ojtrack.test',

      'role' => 'student',
    ]);

    $student->studentDetail()->create([
      'year' => 4,
      'program' => 'BSIT',
      'major' => 'Web Development',
      'section' => 'A',
    ]);
  }
}