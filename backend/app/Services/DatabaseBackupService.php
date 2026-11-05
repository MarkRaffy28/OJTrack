<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Symfony\Component\Process\Process;

class DatabaseBackupService {
  private const DIRECTORY = 'backups';

  public function create(): string {
    $disk = Storage::disk('b2');

    $connection = config('database.default');
    $timestamp = now()->format('Y-m-d_H-i-s');

    if (in_array($connection, ['sqlite'], true)) {
      $source = config("database.connections.{$connection}.database");
      if ($source === ':memory:' || !is_file($source)) {
        throw new RuntimeException('The SQLite database file could not be found.');
      }
      $name = self::DIRECTORY . "/database_{$timestamp}.sqlite";
      $handle = fopen($source, 'rb');
      if ($handle === false || !$disk->put($name, $handle)) {
        if (is_resource($handle)) {
          fclose($handle);
        }
        throw new RuntimeException('The database backup could not be created.');
      }
      fclose($handle);
      return $name;
    }

    if (!in_array($connection, ['mysql', 'mariadb'], true)) {
      throw new RuntimeException("Backups are not supported for the {$connection} database driver.");
    }

    $name = self::DIRECTORY . "/database_{$timestamp}.sql";
    $temporaryPath = tempnam(sys_get_temp_dir(), 'ojtrack-backup-');
    if ($temporaryPath === false) {
      throw new RuntimeException('The database backup could not be created.');
    }
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
      '--result-file=' . $temporaryPath,
      $database['database'],
    ], base_path(), $environment);
    $process->setTimeout(300);
    $process->run();

    if (!$process->isSuccessful()) {
      @unlink($temporaryPath);
      throw new RuntimeException(trim($process->getErrorOutput()) ?: 'The database backup could not be created.');
    }

    $handle = fopen($temporaryPath, 'rb');
    $uploaded = $handle !== false && $disk->put($name, $handle);
    if (is_resource($handle)) {
      fclose($handle);
    }
    @unlink($temporaryPath);

    if (!$uploaded) {
      throw new RuntimeException('The database backup could not be created.');
    }

    return $name;
  }

  public function restore(string $path): void {
    $connection = config('database.default');
    $database = config("database.connections.{$connection}");

    $disk = Storage::disk('b2');
    $handle = $disk->readStream($path);
    if ($handle === false) {
      throw new RuntimeException('The backup file could not be opened.');
    }

    if ($connection === 'sqlite') {
      if (!str_ends_with(strtolower($path), '.sqlite')) {
        fclose($handle);
        throw new RuntimeException('SQLite restore files must use the .sqlite extension.');
      }

      $temporaryPath = tempnam(sys_get_temp_dir(), 'ojtrack-restore-');
      if ($temporaryPath === false) {
        fclose($handle);
        throw new RuntimeException('The SQLite restore file could not be prepared.');
      }

      $temporaryHandle = fopen($temporaryPath, 'wb');
      $copied = $temporaryHandle !== false && stream_copy_to_stream($handle, $temporaryHandle) !== false;
      if (is_resource($temporaryHandle)) {
        fclose($temporaryHandle);
      }
      fclose($handle);

      if (!$copied || !copy($temporaryPath, $database['database'])) {
        @unlink($temporaryPath);
        throw new RuntimeException('The SQLite database could not be restored.');
      }
      @unlink($temporaryPath);
      return;
    }

    if (!in_array($connection, ['mysql', 'mariadb'], true)) {
      fclose($handle);
      throw new RuntimeException("Backups are not supported for the {$connection} database driver.");
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
    $disk = Storage::disk('b2');
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

  public function delete(string $path): void {
    if (!Storage::disk('b2')->delete($path)) {
      throw new RuntimeException('The database backup could not be deleted.');
    }
  }
}
