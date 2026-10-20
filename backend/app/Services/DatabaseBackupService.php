<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Symfony\Component\Process\Process;

class DatabaseBackupService {
  private const DIRECTORY = 'backups';

  public function create(): string {
    $disk = Storage::disk('local');
    $disk->makeDirectory(self::DIRECTORY);
    $connection = config('database.default');
    $timestamp = now()->format('Y-m-d_H-i-s');

    if (in_array($connection, ['sqlite'], true)) {
      $source = config("database.connections.{$connection}.database");
      if ($source === ':memory:' || !is_file($source)) {
        throw new RuntimeException('The SQLite database file could not be found.');
      }
      $name = self::DIRECTORY . "/database_{$timestamp}.sqlite";
      if (!copy($source, $disk->path($name))) {
        throw new RuntimeException('The database backup could not be created.');
      }
      return $name;
    }

    if (!in_array($connection, ['mysql', 'mariadb'], true)) {
      throw new RuntimeException("Backups are not supported for the {$connection} database driver.");
    }

    $name = self::DIRECTORY . "/database_{$timestamp}.sql";
    $output = $disk->path($name);
    $database = config("database.connections.{$connection}");
    $environment = getenv();
    if (($database['password'] ?? '') !== '') {
      $environment['MYSQL_PWD'] = $database['password'];
    }
    $process = new Process([
      env('MYSQLDUMP_BINARY', 'mysqldump'),
      '--protocol=TCP',
      '--host=' . $database['host'],
      '--port=' . $database['port'],
      '--user=' . $database['username'],
      '--single-transaction',
      '--routines',
      '--triggers',
      '--result-file=' . $output,
      $database['database'],
    ], base_path(), $environment);
    $process->setTimeout(300);
    $process->run();

    if (!$process->isSuccessful()) {
      $disk->delete($name);
      throw new RuntimeException(trim($process->getErrorOutput()) ?: 'The database backup could not be created.');
    }

    return $name;
  }

  public function restore(string $absolutePath): void {
    $connection = config('database.default');
    $database = config("database.connections.{$connection}");

    if ($connection === 'sqlite') {
      if (!str_ends_with(strtolower($absolutePath), '.sqlite')) {
        throw new RuntimeException('SQLite restore files must use the .sqlite extension.');
      }
      if (!copy($absolutePath, $database['database'])) {
        throw new RuntimeException('The SQLite database could not be restored.');
      }
      return;
    }

    if (!in_array($connection, ['mysql', 'mariadb'], true)) {
      throw new RuntimeException("Backups are not supported for the {$connection} database driver.");
    }

    $handle = fopen($absolutePath, 'rb');
    if ($handle === false) {
      throw new RuntimeException('The backup file could not be opened.');
    }
    try {
      $environment = getenv();
      if (($database['password'] ?? '') !== '') {
        $environment['MYSQL_PWD'] = $database['password'];
      }
      $process = new Process([
        env('MYSQL_BINARY', 'mysql'),
        '--protocol=TCP',
        '--host=' . $database['host'],
        '--port=' . $database['port'],
        '--user=' . $database['username'],
        $database['database'],
      ], base_path(), $environment);
      $process->setInput($handle);
      $process->setTimeout(300);
      $process->run();
      if (!$process->isSuccessful()) {
        throw new RuntimeException(trim($process->getErrorOutput()) ?: 'The database backup could not be restored.');
      }
    } finally {
      fclose($handle);
    }
  }

  public function all(): array {
    $disk = Storage::disk('local');
    return collect($disk->files(self::DIRECTORY))
      ->filter(fn(string $file) => preg_match('/\.(sql|sqlite)$/i', $file))
      ->sortByDesc(fn(string $file) => $disk->lastModified($file))
      ->map(fn(string $file) => [
        'path' => $file,
        'name' => basename($file),
        'size' => $disk->size($file),
        'created_at' => $disk->lastModified($file),
      ])->values()->all();
  }
}
