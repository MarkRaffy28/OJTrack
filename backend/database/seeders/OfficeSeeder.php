<?php

namespace Database\Seeders;

use App\Models\Office;
use Illuminate\Database\Seeder;

class OfficeSeeder extends Seeder {
  /**
   * Run the database seeds.
   */
  public function run(): void {
    Office::updateOrCreate(['name' => 'ISPSC Sta. Maria Campus'], [
      'name' => 'ISPSC Sta. Maria Campus',
      'address' => 'Sta. Maria, Ilocos Sur',
      'contact_email' => 'info@ispsc.edu.ph',
      'contact_phone' => null,

      'morning_in' => '08:00:00',
      'morning_out' => '12:00:00',
      'afternoon_in' => '13:00:00',
      'afternoon_out' => '17:00:00',
    ]);

    Office::updateOrCreate(['name' => 'Municipal Government Office'], [
      'name' => 'Municipal Government Office',
      'address' => 'Sta. Maria, Ilocos Sur',
      'contact_email' => null,
      'contact_phone' => null,

      'morning_in' => '08:00:00',
      'morning_out' => '12:00:00',
      'afternoon_in' => '13:00:00',
      'afternoon_out' => '17:00:00',
    ]);

    Office::updateOrCreate(['name' => 'ABC Computer Services'], [
      'name' => 'ABC Computer Services',
      'address' => 'Sta. Maria, Ilocos Sur',
      'contact_email' => 'contact@example.com',
      'contact_phone' => null,

      'morning_in' => '08:00:00',
      'morning_out' => '12:00:00',
      'afternoon_in' => '13:00:00',
      'afternoon_out' => '17:00:00',
    ]);
  }
}
