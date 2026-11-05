<?php

use App\Enums\AccountStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Admin\DeveloperConsoleController;
use App\Http\Controllers\Web\Admin\ActivityController;
use App\Http\Controllers\Web\Admin\BackupController;
use App\Http\Controllers\Web\Admin\EvaluationCriteriaController;
use App\Http\Controllers\Web\Admin\OjtController;
use App\Http\Controllers\Web\Admin\SettingController;
use App\Http\Controllers\Web\AssignmentController;
use App\Http\Controllers\Web\AttendanceController;
use App\Http\Controllers\Web\AuthController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\EvaluationController;
use App\Http\Controllers\Web\OfficeController;
use App\Http\Controllers\Web\ReportAssignmentController;
use App\Http\Controllers\Web\ReportController;
use App\Http\Controllers\Web\StudentOjtController;
use App\Http\Controllers\Web\UserController;
use App\Models\Ojt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get("/", function () {
  if (!Auth::check()) {
    return redirect()->route("login");
  }

  $user = Auth::user();

  if ($user->role === UserRole::INSTRUCTOR && $user->status === AccountStatus::PRE_ACTIVATED) {
    return redirect()->route("register");
  }

  return redirect()->route("{$user->role->value}.dashboard");
});

// Cohort selection
Route::post('/cohort/select', function (Request $request) {
  $request->validate([
    'cohort' => ['required', 'string'],
  ]);

  $parts = explode(' - ', $request->input('cohort'), 2);

  abort_if(count($parts) !== 2, 422, 'Invalid cohort format.');

  [$academicYear, $term] = $parts;

  $exists = Ojt::query()
    ->where('academic_year', trim($academicYear))
    ->where('term', trim($term))
    ->exists();

  abort_unless($exists, 422, 'Invalid cohort.');

  session([
    'selected_cohort' => [
      'academic_year' => trim($academicYear),
      'term' => trim($term),
    ],
  ]);

  return back();
})->middleware(['auth', 'throttle:web-sensitive'])->name('cohort.select');

// Guest routes
Route::middleware("guest")->group(function () {
  Route::get("/login", [AuthController::class, "index"])->name("login");

  Route::post("/login", [AuthController::class, "store"])
    ->middleware('throttle:web-auth')
    ->name("login.authenticate");
});

// Authenticated routes
Route::middleware("auth")->group(function () {
  Route::get("/register", [AuthController::class, "showRegister"])->name("register");

  Route::post("/register", [AuthController::class, "registerInstructor"])
    ->middleware('throttle:web-sensitive')
    ->name("register.store");

  Route::post("/logout", [AuthController::class, "logout"])->name("logout");

  foreach (["super-admin", "admin", "instructor"] as $rolePrefix) {
    Route::prefix("/{$rolePrefix}")
      ->name("{$rolePrefix}.")
      ->middleware("role:{$rolePrefix}")
      ->group(function () use ($rolePrefix) {
        Route::get("/", [DashboardController::class, "index"])->name("dashboard");

        Route::prefix("/dashboard")->name("dashboard.")->group(function () {
          Route::get("/", [DashboardController::class, "index"])->name("index");
        });

        // Users
        Route::prefix("/users")->name("users.")->group(function () {
          Route::get("/", [UserController::class, "index"])->name("index");
          Route::get("/create", [UserController::class, "create"])->name("create");

          Route::post("/", [UserController::class, "store"])
            ->middleware('throttle:web-sensitive')
            ->name("store");

          Route::get("/{user}/show", [UserController::class, "show"])
            ->withTrashed()->name("show");

          Route::get("/{user}/edit", [UserController::class, "edit"])->name("edit");

          Route::put("/{user}/update", [UserController::class, "update"])
            ->middleware('throttle:web-sensitive')
            ->name("update");

          Route::patch("/{user}/restore", [UserController::class, "restore"])
            ->withTrashed()
            ->middleware('throttle:web-sensitive')
            ->name("restore");

          Route::delete("/{user}/delete", [UserController::class, "destroy"])
            ->middleware('throttle:web-sensitive')
            ->name("destroy");
        });

        // Offices
        Route::prefix("/offices")->name("offices.")->group(function () {
          Route::get("/", [OfficeController::class, "index"])->name("index");
          Route::get("/create", [OfficeController::class, "create"])->name("create");

          Route::post("/", [OfficeController::class, "store"])
            ->middleware('throttle:web-sensitive')
            ->name("store");

          Route::get("/{office}/show", [OfficeController::class, "show"])
            ->withTrashed()->name("show");

          Route::get("/{office}/edit", [OfficeController::class, "edit"])->name("edit");

          Route::put("/{office}/update", [OfficeController::class, "update"])
            ->middleware('throttle:web-sensitive')
            ->name("update");

          Route::patch("/{office}/restore", [OfficeController::class, "restore"])
            ->withTrashed()
            ->middleware('throttle:web-sensitive')
            ->name("restore");

          Route::delete("/{office}/delete", [OfficeController::class, "destroy"])
            ->middleware('throttle:web-sensitive')
            ->name("destroy");
        });

        // Assignments
        Route::prefix("/assignments")->name("assignments.")->group(function () {
          Route::get("/", [AssignmentController::class, "index"])->name("index");
          Route::get("/create", [AssignmentController::class, "create"])->name("create");

          Route::post("/", [AssignmentController::class, "store"])
            ->middleware('throttle:web-sensitive')
            ->name("store");

          Route::get("/{studentOjt}/show", [AssignmentController::class, "show"])
            ->withTrashed()->name("show");

          Route::get("/{studentOjt}/edit", [AssignmentController::class, "edit"])->name("edit");

          Route::put("/{studentOjt}/update", [AssignmentController::class, "update"])
            ->middleware('throttle:web-sensitive')
            ->name("update");

          Route::patch("/{studentOjt}/restore", [AssignmentController::class, "restore"])
            ->withTrashed()
            ->middleware('throttle:web-sensitive')
            ->name("restore");

          Route::delete("/{studentOjt}/delete", [AssignmentController::class, "destroy"])
            ->middleware('throttle:web-sensitive')
            ->name("destroy");
        });

        // Student OJTs
        Route::prefix("/student-ojts")->name("student-ojts.")->group(function () {
          Route::get("/", [StudentOjtController::class, "index"])->name("index");
          Route::get("/completed", [DashboardController::class, "completed"])->name("completed");
          Route::get("/students-at-risk", [DashboardController::class, "atRisk"])->name("students-at-risk");
          Route::get("/absent", [DashboardController::class, "absent"])->name("absent");

          Route::get("/{studentOjt}/show", [StudentOjtController::class, "show"])
            ->withTrashed()->name("show");
        });

        // Reports
        Route::prefix("/reports")->name("reports.")->group(function () {
          Route::get("/", [ReportController::class, "index"])->name("index");
          Route::get("/create", [ReportController::class, "create"])->name("create");

          Route::post("/", [ReportController::class, "store"])
            ->middleware('throttle:web-sensitive')
            ->name("store");

          Route::get("/{report}/show", [ReportController::class, "show"])
            ->withTrashed()->name("show");

          Route::get("/{report}/edit", [ReportController::class, "edit"])->name("edit");

          Route::put("/{report}/update", [ReportController::class, "update"])
            ->middleware('throttle:web-sensitive')
            ->name("update");

          Route::patch("/{report}/restore", [ReportController::class, "restore"])
            ->withTrashed()
            ->middleware('throttle:web-sensitive')
            ->name("restore");

          Route::delete("/{report}/delete", [ReportController::class, "destroy"])
            ->middleware('throttle:web-sensitive')
            ->name("destroy");
        });

        // Report assignments
        Route::prefix('/report-assignments')->name('report-assignments.')->group(function () {
          Route::get('/', [ReportAssignmentController::class, 'index'])->name('index');
          Route::get('/create', [ReportAssignmentController::class, 'create'])->name('create');

          Route::get('/{reportAssignment}/show', [ReportAssignmentController::class, 'show'])
            ->withTrashed()->name('show');

          Route::get('/{reportAssignment}/edit', [ReportAssignmentController::class, 'edit'])->name('edit');

          Route::post('/', [ReportAssignmentController::class, 'store'])
            ->middleware('throttle:web-sensitive')
            ->name('store');

          Route::put('/{reportAssignment}', [ReportAssignmentController::class, 'update'])
            ->middleware('throttle:web-sensitive')
            ->name('update');

          Route::patch('/{reportAssignment}/restore', [ReportAssignmentController::class, 'restore'])
            ->withTrashed()
            ->middleware('throttle:web-sensitive')
            ->name('restore');

          Route::delete('/{reportAssignment}', [ReportAssignmentController::class, 'destroy'])
            ->middleware('throttle:web-sensitive')
            ->name('destroy');
        });

        // Evaluations
        Route::prefix("/evaluations")->name("evaluations.")->group(function () {
          Route::get("/", [EvaluationController::class, "index"])->name("index");
          Route::get("/create", [EvaluationController::class, "create"])->name("create");

          Route::post("/", [EvaluationController::class, "store"])
            ->middleware('throttle:web-sensitive')
            ->name("store");

          Route::get("/{studentOjt}/show", [EvaluationController::class, "show"])
            ->withTrashed()->name("show");

          Route::get("/{studentOjt}/details/{evaluationDetail}/show", [EvaluationController::class, "detailShow"])
            ->name("detail.show");

          Route::get("/{studentOjt}/details/{evaluationDetail}/edit", [EvaluationController::class, "detailEdit"])
            ->name("detail.edit");

          Route::get("/{studentOjt}/details/{period}/create", [EvaluationController::class, "detailCreate"])
            ->name("detail.create");

          Route::post("/{studentOjt}/details/{period}", [EvaluationController::class, "detailStore"])
            ->middleware('throttle:web-sensitive')
            ->name("detail.store");

          Route::put("/{studentOjt}/details/{evaluationDetail}", [EvaluationController::class, "detailUpdate"])
            ->middleware('throttle:web-sensitive')
            ->name("detail.update");

          Route::delete("/{studentOjt}/details/{evaluationDetail}", [EvaluationController::class, "detailDestroy"])
            ->middleware('throttle:web-sensitive')
            ->name("detail.destroy");

          Route::get("/{studentOjt}/create", [EvaluationController::class, "create"])
            ->name("create-for");

          Route::post("/{studentOjt}", [EvaluationController::class, "store"])
            ->middleware('throttle:web-sensitive')
            ->name("store-for");

          Route::get("/{studentOjt}/edit", [EvaluationController::class, "edit"])->name("edit");

          Route::put("/{studentOjt}/update", [EvaluationController::class, "update"])
            ->middleware('throttle:web-sensitive')
            ->name("update");

          Route::delete("/{studentOjt}/delete", [EvaluationController::class, "destroy"])
            ->middleware('throttle:web-sensitive')
            ->name("destroy");
        });

        // Attendance
        Route::prefix("/attendance")->name("attendance.")->group(function () {
          Route::get("/", [AttendanceController::class, "index"])->name("index");
          Route::get("/create", [AttendanceController::class, "create"])->name("create");

          Route::post("/", [AttendanceController::class, "store"])
            ->middleware('throttle:web-sensitive')
            ->name("store");

          Route::get("/{attendance}/show", [AttendanceController::class, "show"])->name("show");
          Route::get("/{attendance}/edit", [AttendanceController::class, "edit"])->name("edit");

          Route::put("/{attendance}/update", [AttendanceController::class, "update"])
            ->middleware('throttle:web-sensitive')
            ->name("update");

          Route::patch("/{attendance}/toggle", [AttendanceController::class, "toggleApproval"])
            ->middleware('throttle:web-sensitive')
            ->name("toggle");

          Route::patch("/{attendance}/toggle-slot/{slot}", [AttendanceController::class, "toggleSlot"])
            ->middleware('throttle:web-sensitive')
            ->name("toggle-slot");

          Route::delete("/{attendance}/delete", [AttendanceController::class, "destroy"])
            ->middleware('throttle:web-sensitive')
            ->name("destroy");
        });

        // Settings and backups
        Route::prefix('/settings')->name('settings.')->group(function () {
          Route::get('/', [SettingController::class, 'index'])->name('index');
          Route::get('/edit', [SettingController::class, 'edit'])->name('edit');

          Route::put('/update', [SettingController::class, 'update'])
            ->middleware('throttle:web-sensitive')
            ->name('update');

          Route::get('/backups', [BackupController::class, 'index'])->name('backups.index');

          Route::post('/backups', [BackupController::class, 'store'])
            ->middleware('throttle:web-sensitive')
            ->name('backups.store');

          Route::post('/backups/restore', [BackupController::class, 'restore'])
            ->middleware('throttle:web-sensitive')
            ->name('backups.restore');

          Route::delete('/backups/{backup}', [BackupController::class, 'destroy'])
            ->middleware('throttle:web-sensitive')
            ->where('backup', '.+')
            ->name('backups.destroy');

          Route::get('/backups/{backup}', [BackupController::class, 'download'])
            ->where('backup', '.+')->name('backups.download');

          Route::get('/evaluation-criterias', [EvaluationCriteriaController::class, 'edit'])
            ->name('evaluation-criterias.edit');

          Route::put('/evaluation-criterias', [EvaluationCriteriaController::class, 'update'])
            ->middleware('throttle:web-sensitive')
            ->name('evaluation-criterias.update');
        });

        // OJT terms
        Route::prefix('/ojts')->name('ojts.')->group(function () {
          Route::get('/', [OjtController::class, 'index'])->name('index');
          Route::get('/create', [OjtController::class, 'create'])->name('create');

          Route::post('/', [OjtController::class, 'store'])
            ->middleware('throttle:web-sensitive')
            ->name('store');

          Route::get('/{ojt}/show', [OjtController::class, 'show'])->name('show');
          Route::get('/{ojt}/edit', [OjtController::class, 'edit'])->name('edit');

          Route::put('/{ojt}', [OjtController::class, 'update'])
            ->middleware('throttle:web-sensitive')
            ->name('update');

          Route::delete('/{ojt}', [OjtController::class, 'destroy'])
            ->middleware('throttle:web-sensitive')
            ->name('destroy');
        });

        // Activities
        Route::prefix('/activities')->name('activities.')->group(function () {
          Route::get('/', [ActivityController::class, 'index'])->name('index');
          Route::get('/{activity}', [ActivityController::class, 'show'])->name('show');
        });

        // Developer console
        if ($rolePrefix === 'admin' || $rolePrefix === 'super-admin') {
          Route::middleware('can:access-developer-console')
            ->prefix('developer-console')
            ->name('developer-console.')
            ->group(function () {
              Route::get('/', [DeveloperConsoleController::class, 'index'])->name('index');

              Route::post('/run', [DeveloperConsoleController::class, 'run'])
                ->middleware('throttle:3,1')
                ->name('run');

              Route::get('/logs', [DeveloperConsoleController::class, 'logs'])->name('logs');

              Route::delete('/logs', [DeveloperConsoleController::class, 'deleteLogs'])
                ->middleware('throttle:web-sensitive')
                ->name('logs.delete');
            });
        }
      });
  }
});
