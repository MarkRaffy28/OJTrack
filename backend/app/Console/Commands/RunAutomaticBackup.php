<?php

namespace App\Console\Commands;

use App\Models\Setting;
use App\Services\DatabaseBackupService;
use Illuminate\Console\Command;

class RunAutomaticBackup extends Command {
  protected $signature = 'backup:automatic';
  protected $description = 'Create a database backup when the configured interval is due';

  public function handle(DatabaseBackupService $backups): int {
    $interval = Setting::query()->where('setting_key', 'backup_interval')->value('setting_value');
    if (!$interval || $interval === 'disabled') return self::SUCCESS;

    $latest = $backups->all()[0] ?? null;
    $seconds = match ($interval) {
      'hourly' => 3600,
      'daily' => 86400,
      'weekly' => 604800,
      default => null,
    };
    if (!$seconds || ($latest && $latest['created_at'] > now()->subSeconds($seconds)->timestamp)) {
      return self::SUCCESS;
    }

    $path = $backups->create();
    $this->info("Created {$path}");
    return self::SUCCESS;
  }
}
