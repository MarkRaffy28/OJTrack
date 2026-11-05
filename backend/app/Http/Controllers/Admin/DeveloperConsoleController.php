<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Throwable;

class DeveloperConsoleController extends Controller {
  public function index() {
    return view('admin.developer-console.index', [
      'commands' => config('developer_console.commands', []),
    ]);
  }

  public function run(Request $request) {
    $validated = $request->validate([
      'command' => ['required', 'string', 'max:60'],
    ]);

    $commands = config('developer_console.commands');
    $key = $validated['command'];

    // The submitted value can select a key only.
    if (!isset($commands[$key])) {
      throw ValidationException::withMessages([
        'command' => 'Command is not allowed.',
      ]);
    }

    $command = $commands[$key];

    // Keep output private; never return it to unauthorized users.
    try {
      $exitCode = Artisan::call($command['command']);
      $output = Artisan::output();

      Log::channel('daily')->info(
        'Developer console command executed',
        [
          'user_id' => $request->user()->getAuthIdentifier(),
          'command_key' => $key,
          'exit_code' => $exitCode,
        ]
      );

      return back()->with(
        'console_result',
        [
          'success' => $exitCode === 0,
          'output' => mb_substr($output, 0, 12000),
        ]
      );
    } catch (Throwable $exception) {
      Log::channel('daily')->error(
        'Developer console command failed',
        [
          'user_id' => $request->user()->getAuthIdentifier(),
          'command_key' => $key,
          'exception' => get_class($exception),
        ]
      );

      return back()->withErrors([
        'console' => 'Execution failed. Check the protected server logs.',
      ]);
    }
  }
  public function logs() {
    $path = storage_path('logs/laravel.log');
    $entries = [];

    if (File::exists($path)) {
      $content = File::get($path);

      // Split the log into entries using Laravel timestamps.
      $chunks = preg_split(
        '/(?=^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\])/m',
        $content,
        -1,
        PREG_SPLIT_NO_EMPTY
      );

      foreach (array_slice(array_reverse($chunks), 0, 100) as $chunk) {
        if (!preg_match(
          '/^\[(.*?)\]\s+\w+\.(DEBUG|INFO|NOTICE|WARNING|ERROR|CRITICAL|ALERT|EMERGENCY):\s*(.*)/s',
          trim($chunk),
          $match
        )) {
          continue;
        }

        $message = $match[3];

        // Extract the readable message, stopping before the stack trace.
        $parts = preg_split(
          '/\s+(?:Stack trace:|#\d+\s|Next\s|Previous\s)/i',
          $message,
          2
        );

        $cleanMessage = trim($parts[0]);

        // Preserve the original details for the expandable section.
        $stackTrace = trim(substr($message, strlen($cleanMessage)));

        $entries[] = [
          'date' => $match[1],
          'level' => $match[2],
          'message' => $cleanMessage,
          'stack_trace' => $stackTrace,
        ];
      }
    }

    return view('admin.developer-console.logs', compact('entries'));
  }

  public function deleteLogs(Request $request) {
    $request->validate([
      'confirm' => ['required', 'accepted'],
    ]);

    $path = storage_path('logs/laravel.log');

    if (File::exists($path)) {
      File::put($path, '');
    }

    Log::info('Laravel log file cleared by developer console.', [
      'user_id' => $request->user()->id,
    ]);

    return redirect()
      ->route($request->user()->role->value . '.developer-console.logs')
      ->with('status', 'Log file cleared.');
  }
}