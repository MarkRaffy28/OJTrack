<?php

namespace Database\Seeders;

use App\Models\InstructorDetail;
use App\Models\Office;
use App\Models\StudentDetail;
use App\Models\SupervisorDetail;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $office = Office::where('name', 'ISPSC Sta. Maria Campus')->firstOrFail();

        $admin = User::updateOrCreate(['user_id' => 'ADM-0001'], [
            'username' => 'admin', 'password' => Hash::make('password'), 'first_name' => 'System', 'middle_name' => null, 'last_name' => 'Administrator', 'extension_name' => null,
            'birth_date' => '1990-01-01', 'gender' => 'Male', 'home_address' => 'Sta. Maria, Ilocos Sur', 'present_address' => 'Sta. Maria, Ilocos Sur', 'contact_number' => '09123456789', 'email' => 'admin@ojtrack.test', 'role' => 'admin', 'status' => 'active', 'activated_at' => now(),
        ]);

        $student = User::updateOrCreate(['user_id' => 'STU-0001'], [
            'username' => 'student', 'password' => Hash::make('password'), 'first_name' => 'Juan', 'middle_name' => null, 'last_name' => 'Dela Cruz', 'extension_name' => null,
            'birth_date' => '2004-05-10', 'gender' => 'Male', 'home_address' => 'Sta. Maria, Ilocos Sur', 'present_address' => 'Sta. Maria, Ilocos Sur', 'contact_number' => '09123456789', 'email' => 'student@ojtrack.test', 'role' => 'student', 'status' => 'active', 'activated_at' => now(),
        ]);
        $student->studentDetail()->updateOrCreate([], ['year' => 4, 'program' => 'BSIT', 'major' => 'Web and Mobile Development', 'section' => 'A']);
        $student->emergencyContacts()->updateOrCreate(['is_primary' => true], ['name' => 'Maria Dela Cruz', 'relationship' => 'Mother', 'contact_number' => '09123456789', 'address' => 'Sta. Maria, Ilocos Sur']);

        $supervisor = User::updateOrCreate(['user_id' => 'SUP-0001'], [
            'username' => 'supervisor', 'password' => Hash::make('password'), 'first_name' => 'Maria', 'middle_name' => null, 'last_name' => 'Santos', 'extension_name' => null,
            'birth_date' => '1985-03-15', 'gender' => 'Female', 'home_address' => 'Sta. Maria, Ilocos Sur', 'present_address' => 'Sta. Maria, Ilocos Sur', 'contact_number' => '09123456789', 'email' => 'supervisor@ojtrack.test', 'role' => 'supervisor', 'status' => 'active', 'activated_at' => now(),
        ]);
        $supervisor->supervisorDetail()->updateOrCreate([], ['office_id' => $office->id, 'position' => 'OJT Supervisor']);
    }
}
