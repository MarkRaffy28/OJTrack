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
    $this->call([
      OfficeSeeder::class,
      UserSeeder::class,
      DemoDataSeeder::class,
    ]);

    foreach ([
      'academic_year' => '2026-2027',
      'term' => '2nd',
      'required_hours' => '600',
      'start_date' => '2026-09-01',
      'end_date' => '2027-05-31',
      'evaluation_open' => 'true',
      'evaluation_trigger_days' => '7',
    ] as $key => $value) {
      DB::table('settings')->updateOrInsert(
        ['setting_key' => $key],
        ['setting_value' => $value, 'updated_at' => now(), 'created_at' => now()],
      );
    }
  }
}
