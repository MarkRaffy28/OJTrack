<?php

use App\Http\Controllers\Web\Admin\ActivityController;
use App\Http\Controllers\Web\Admin\BackupController;
use App\Http\Controllers\Web\Admin\EvaluationCriteriaController;
use App\Http\Controllers\Web\Admin\SettingController;
use App\Http\Controllers\Web\Admin\OjtController;
use App\Http\Controllers\Web\AssignmentController;
use App\Http\Controllers\Web\AttendanceController;
use App\Http\Controllers\Web\AuthController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\EvaluationController;
use App\Http\Controllers\Web\OfficeController;
use App\Http\Controllers\Web\ReportController;
use App\Http\Controllers\Web\ReportAssignmentController;
use App\Http\Controllers\Web\StudentOjtController;
use App\Http\Controllers\Web\UserController;
use App\Models\Ojt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::prefix("web")->name("web.")->group(function () {
  Route::get("/", function () {
    if (!Auth::check()) {
      return redirect()->route("web.login");
    }
    $user = Auth::user();
    if ($user->role === \App\Enums\UserRole::INSTRUCTOR && $user->status === \App\Enums\AccountStatus::PRE_ACTIVATED) {
      return redirect()->route("web.register");
    }
    return redirect()->route("web." . $user->role->value . ".dashboard");
  });

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
  })->name('cohort.select');

  Route::middleware("guest")->group(function () {
    Route::get("/login", [AuthController::class, "index"])->name("login");
    Route::post("/login", [AuthController::class, "store"])->name("login.authenticate");
  });

  Route::middleware("auth")->group(function () {
    Route::get("/register", [AuthController::class, "showRegister"])->name("register");
    Route::post("/register", [AuthController::class, "registerInstructor"])->name("register.store");
    Route::post("/logout", [AuthController::class, "logout"])->name("logout");

    foreach (["super-admin", "admin", "instructor"] as $rolePrefix) {
      Route::prefix("/{$rolePrefix}")
        ->name("{$rolePrefix}.")
        ->middleware("role:{$rolePrefix}")
        ->group(function () {
        Route::get("/", [DashboardController::class, "index"])->name("dashboard");

        Route::prefix("/dashboard")->name("dashboard.")->group(function () {
          Route::get("/", [DashboardController::class, "index"])->name("index");
        });

        Route::prefix("/users")->name("users.")->group(function () {
          Route::get("/", [UserController::class, "index"])->name("index");
          Route::get("/create", [UserController::class, "create"])->name("create");
          Route::post("/", [UserController::class, "store"])->name("store");

          Route::get("/{user}/show", [UserController::class, "show"])->withTrashed()->name("show");
          Route::get("/{user}/edit", [UserController::class, "edit"])->name("edit");
          Route::put("/{user}/update", [UserController::class, "update"])->name("update");
          Route::patch("/{user}/restore", [UserController::class, "restore"])->withTrashed()->name("restore");
          Route::delete("/{user}/delete", [UserController::class, "destroy"])->name("destroy");
        });

        Route::prefix("/offices")->name("offices.")->group(function () {
          Route::get("/", [OfficeController::class, "index"])->name("index");
          Route::get("/create", [OfficeController::class, "create"])->name("create");
          Route::post("/", [OfficeController::class, "store"])->name("store");

          Route::get("/{office}/show", [OfficeController::class, "show"])->withTrashed()->name("show");
          Route::get("/{office}/edit", [OfficeController::class, "edit"])->name("edit");
          Route::put("/{office}/update", [OfficeController::class, "update"])->name("update");
          Route::patch("/{office}/restore", [OfficeController::class, "restore"])->withTrashed()->name("restore");
          Route::delete("/{office}/delete", [OfficeController::class, "destroy"])->name("destroy");
        });

        Route::prefix("/assignments")->name("assignments.")->group(function () {
          Route::get("/", [AssignmentController::class, "index"])->name("index");
          Route::get("/create", [AssignmentController::class, "create"])->name("create");
          Route::post("/", [AssignmentController::class, "store"])->name("store");

          Route::get("/{studentOjt}/show", [AssignmentController::class, "show"])->withTrashed()->name("show");
          Route::get("/{studentOjt}/edit", [AssignmentController::class, "edit"])->name("edit");
          Route::put("/{studentOjt}/update", [AssignmentController::class, "update"])->name("update");
          Route::patch("/{studentOjt}/restore", [AssignmentController::class, "restore"])->withTrashed()->name("restore");
          Route::delete("/{studentOjt}/delete", [AssignmentController::class, "destroy"])->name("destroy");
        });

        Route::prefix("/student-ojts")->name("student-ojts.")->group(function () {
          Route::get("/", [StudentOjtController::class, "index"])->name("index");
          Route::get("/completed", [DashboardController::class, "completed"])->name("completed");
          Route::get("/students-at-risk", [DashboardController::class, "atRisk"])->name("students-at-risk");
          Route::get("/absent", [DashboardController::class, "absent"])->name("absent");
          Route::get("/{studentOjt}/show", [StudentOjtController::class, "show"])->withTrashed()->name("show");
        });

        Route::prefix("/reports")->name("reports.")->group(function () {
          Route::get("/", [ReportController::class, "index"])->name("index");
          Route::get("/create", [ReportController::class, "create"])->name("create");
          Route::post("/", [ReportController::class, "store"])->name("store");
          Route::get("/{report}/show", [ReportController::class, "show"])->withTrashed()->name("show");
          Route::get("/{report}/edit", [ReportController::class, "edit"])->name("edit");
          Route::put("/{report}/update", [ReportController::class, "update"])->name("update");
          Route::patch("/{report}/restore", [ReportController::class, "restore"])->withTrashed()->name("restore");
          Route::delete("/{report}/delete", [ReportController::class, "destroy"])->name("destroy");
        });

        Route::prefix('/report-assignments')->name('report-assignments.')->group(function () {
          Route::get('/', [ReportAssignmentController::class, 'index'])->name('index');
          Route::get('/create', [ReportAssignmentController::class, 'create'])->name('create');
          Route::get('/{reportAssignment}/show', [ReportAssignmentController::class, 'show'])->withTrashed()->name('show');
          Route::get('/{reportAssignment}/edit', [ReportAssignmentController::class, 'edit'])->name('edit');
          Route::post('/', [ReportAssignmentController::class, 'store'])->name('store');
          Route::put('/{reportAssignment}', [ReportAssignmentController::class, 'update'])->name('update');
          Route::patch('/{reportAssignment}/restore', [ReportAssignmentController::class, 'restore'])->withTrashed()->name('restore');
          Route::delete('/{reportAssignment}', [ReportAssignmentController::class, 'destroy'])->name('destroy');
        });

        Route::prefix("/evaluations")->name("evaluations.")->group(function () {
          Route::get("/", [EvaluationController::class, "index"])->name("index");
          Route::get("/create", [EvaluationController::class, "create"])->name("create");
          Route::post("/", [EvaluationController::class, "store"])->name("store");
          Route::get("/{studentOjt}/show", [EvaluationController::class, "show"])->withTrashed()->name("show");
          Route::get("/{studentOjt}/details/{evaluationDetail}/show", [EvaluationController::class, "detailShow"])->name("detail.show");
          Route::get("/{studentOjt}/details/{evaluationDetail}/edit", [EvaluationController::class, "detailEdit"])->name("detail.edit");
          Route::get("/{studentOjt}/details/{period}/create", [EvaluationController::class, "detailCreate"])->name("detail.create");
          Route::post("/{studentOjt}/details/{period}", [EvaluationController::class, "detailStore"])->name("detail.store");
          Route::put("/{studentOjt}/details/{evaluationDetail}", [EvaluationController::class, "detailUpdate"])->name("detail.update");
          Route::delete("/{studentOjt}/details/{evaluationDetail}", [EvaluationController::class, "detailDestroy"])->name("detail.destroy");
          Route::get("/{studentOjt}/create", [EvaluationController::class, "create"])->name("create-for");
          Route::post("/{studentOjt}", [EvaluationController::class, "store"])->name("store-for");
          Route::get("/{studentOjt}/edit", [EvaluationController::class, "edit"])->name("edit");
          Route::put("/{studentOjt}/update", [EvaluationController::class, "update"])->name("update");
          Route::delete("/{studentOjt}/delete", [EvaluationController::class, "destroy"])->name("destroy");
        });

        Route::prefix("/attendance")->name("attendance.")->group(function () {
          Route::get("/", [AttendanceController::class, "index"])->name("index");
          Route::get("/create", [AttendanceController::class, "create"])->name("create");
          Route::post("/", [AttendanceController::class, "store"])->name("store");

          Route::get("/{attendance}/show", [AttendanceController::class, "show"])->name("show");
          Route::get("/{attendance}/edit", [AttendanceController::class, "edit"])->name("edit");
          Route::put("/{attendance}/update", [AttendanceController::class, "update"])->name("update");
          Route::patch("/{attendance}/toggle", [AttendanceController::class, "toggleApproval"])->name("toggle");
          Route::patch("/{attendance}/toggle-slot/{slot}", [AttendanceController::class, "toggleSlot"])->name("toggle-slot");
          Route::delete("/{attendance}/delete", [AttendanceController::class, "destroy"])->name("destroy");
        });

        Route::prefix('/settings')->name('settings.')->group(function () {
          Route::get('/', [SettingController::class, 'index'])->name('index');
          Route::get('/edit', [SettingController::class, 'edit'])->name('edit');
          Route::put('/update', [SettingController::class, 'update'])->name('update');
          Route::get('/backups', [BackupController::class, 'index'])->name('backups.index');
          Route::post('/backups', [BackupController::class, 'store'])->name('backups.store');
          Route::post('/backups/restore', [BackupController::class, 'restore'])->name('backups.restore');
          Route::get('/backups/{backup}', [BackupController::class, 'download'])->where('backup', '.+')->name('backups.download');
          Route::get('/evaluation-criterias', [EvaluationCriteriaController::class, 'edit'])->name('evaluation-criterias.edit');
          Route::put('/evaluation-criterias', [EvaluationCriteriaController::class, 'update'])->name('evaluation-criterias.update');
        });

        Route::prefix('/ojts')->name('ojts.')->group(function () {
          Route::get('/', [OjtController::class, 'index'])->name('index');
          Route::get('/create', [OjtController::class, 'create'])->name('create');
          Route::post('/', [OjtController::class, 'store'])->name('store');
          Route::get('/{ojt}/show', [OjtController::class, 'show'])->name('show');
          Route::get('/{ojt}/edit', [OjtController::class, 'edit'])->name('edit');
          Route::put('/{ojt}', [OjtController::class, 'update'])->name('update');
          Route::delete('/{ojt}', [OjtController::class, 'destroy'])->name('destroy');
        });
        Route::get('/activities', [ActivityController::class, 'index'])->name('activities.index');
        Route::get('/activities/{activity}', [ActivityController::class, 'show'])->name('activities.show');
      });
    }
  });
});
