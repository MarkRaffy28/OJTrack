<?php

namespace App\Http\Controllers\Web\Admin;

use App\Enums\ActivityAction;
use App\Http\Controllers\Controller;
use App\Models\Backup;
use App\Services\DatabaseBackupService;
use App\Services\ActivityService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class BackupController extends Controller {
  public function index(Request $request, DatabaseBackupService $backups): \Illuminate\Contracts\View\View {
    Gate::authorize('viewAny', Backup::class);

    $backupFiles = $backups->all();
    $interval = \App\Models\Setting::query()->where('setting_key', 'backup_interval')->value('setting_value') ?? 'disabled';
    return view('admin.settings.backups', compact('backupFiles', 'interval'));
  }

  public function store(Request $request, DatabaseBackupService $backups, ActivityService $activityService): RedirectResponse {
    Gate::authorize('create', Backup::class);

    $user = $request->user();
    
    try {
      $path = $backups->create();
      $activityService->log($user, ActivityAction::BACKUP_CREATED, null, null);
      return back()->with('success', 'Database backup created successfully.');
    } catch (Throwable $exception) {
      report($exception);
      return back()->with('error', 'Backup failed: ' . $exception->getMessage());
    }
  }

  public function restore(Request $request, DatabaseBackupService $backups, ActivityService $activityService): RedirectResponse {
    Gate::authorize('restore', Backup::class);

    $validated = $request->validate([
      'backup' => ['required', 'string', Rule::in(array_column($backups->all(), 'path'))],
    ]);

    $user = $request->user();
    $path = $validated['backup'];

    try {
      $backups->restore(Storage::disk('local')->path($path));
      $activityService->log($user, ActivityAction::BACKUP_RESTORED, null, null);
      return back()->with('success', 'Database backup restored successfully.');
    } catch (Throwable $exception) {
      report($exception);
      return back()->with('error', 'Restore failed: ' . $exception->getMessage());
    }
  }

  public function download(Request $request, DatabaseBackupService $backups, string $backup): StreamedResponse {
    Gate::authorize('download', Backup::class);

    $allowed = collect($backups->all())->pluck('path');
    abort_unless($allowed->contains($backup), 404);

    return Storage::disk('local')->download($backup, basename($backup));
  }
}
