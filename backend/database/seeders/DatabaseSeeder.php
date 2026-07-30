<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder {
  use WithoutModelEvents;

  /**
   * Seed the application's database.
   */
  public function run(): void {
    DB::table('settings')->insertOrIgnore([
      [
        'setting_key' => 'academic_year',
        'setting_value' => '2023-2024',
      ],
      [
        'setting_key' => 'term',
        'setting_value' => '1st',
      ],
      [
        'setting_key' => 'required_hours',
        'setting_value' => '600',
      ],
      [
        'setting_key' => 'start_date',
        'setting_value' => '2024-01-01',
      ],
      [
        'setting_key' => 'end_date',
        'setting_value' => '2024-05-31',
      ],
    ]);
  }
}
