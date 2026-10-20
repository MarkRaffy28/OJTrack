<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
  public function up(): void {
    foreach (['daily', 'weekly', 'monthly', 'terminal'] as $type) {
      DB::table('settings')->updateOrInsert(
        ['setting_key' => "report_template_{$type}"],
        ['setting_value' => '', 'created_at' => now(), 'updated_at' => now()],
      );
    }
  }

  public function down(): void {
    DB::table('settings')->whereIn('setting_key', [
      'report_template_daily', 'report_template_weekly',
      'report_template_monthly', 'report_template_terminal',
    ])->delete();
  }
};
