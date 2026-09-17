<?php

use App\Http\Controllers\Web\Admin\SettingController;
use App\Http\Controllers\Web\AssignmentController;
use App\Http\Controllers\Web\AttendanceController;
use App\Http\Controllers\Web\AuthController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\EvaluationController;
use App\Http\Controllers\Web\OfficeController;
use App\Http\Controllers\Web\ReportController;
use App\Http\Controllers\Web\StudentOjtController;
use App\Http\Controllers\Web\UserController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::prefix("web")->name("web.")->group(function () {
  Route::get("/", function () {
    if (!Auth::check()) {
      return redirect()->route("web.login");
    }
    $user = Auth::user();
    if ($user->role === \App\Enums\UserRoles::INSTRUCTOR && $user->status === \App\Enums\AccountStatus::PRE_ACTIVATED) {
      return redirect()->route("web.register");
    }
    return redirect()->route("web." . $user->role->value . ".dashboard");
  });

  Route::middleware("guest")->group(function () {
    Route::get("/login", [AuthController::class, "index"])->name("login");
    Route::post("/login", [AuthController::class, "store"])->name("login.authenticate");
  });

  Route::middleware("auth")->group(function () {
    Route::get("/register", [AuthController::class, "showRegister"])->name("register");
    Route::post("/register", [AuthController::class, "registerInstructor"])->name("register.store");
    Route::post("/logout", [AuthController::class, "logout"])->name("logout");

    foreach (["admin", "instructor"] as $rolePrefix) {
      Route::prefix("/{$rolePrefix}")->name("{$rolePrefix}.")->group(function () {
        Route::get("/", [DashboardController::class, "index"])->name("dashboard");

        Route::prefix("/dashboard")->name("dashboard.")->group(function () {
          Route::get("/", [DashboardController::class, "index"])->name("index");
        });

        Route::prefix("/users")->name("users.")->group(function () {
          Route::get("/", [UserController::class, "index"])->name("index");
          Route::get("/create", [UserController::class, "create"])->name("create");
          Route::post("/", [UserController::class, "store"])->name("store");

          Route::get("/{user}/show", [UserController::class, "show"])->name("show");
          Route::get("/{user}/edit", [UserController::class, "edit"])->name("edit");
          Route::put("/{user}/update", [UserController::class, "update"])->name("update");
          Route::delete("/{user}/delete", [UserController::class, "destroy"])->name("destroy");
        });

        Route::prefix("/offices")->name("offices.")->group(function () {
          Route::get("/", [OfficeController::class, "index"])->name("index");
          Route::get("/create", [OfficeController::class, "create"])->name("create");
          Route::post("/", [OfficeController::class, "store"])->name("store");

          Route::get("/{office}/show", [OfficeController::class, "show"])->name("show");
          Route::get("/{office}/edit", [OfficeController::class, "edit"])->name("edit");
          Route::put("/{office}/update", [OfficeController::class, "update"])->name("update");
          Route::delete("/{office}/delete", [OfficeController::class, "destroy"])->name("destroy");
        });

        Route::prefix("/assignments")->name("assignments.")->group(function () {
          Route::get("/", [AssignmentController::class, "index"])->name("index");
          Route::get("/create", [AssignmentController::class, "create"])->name("create");
          Route::post("/", [AssignmentController::class, "store"])->name("store");

          Route::get("/{studentOjt}/show", [AssignmentController::class, "show"])->name("show");
          Route::get("/{studentOjt}/edit", [AssignmentController::class, "edit"])->name("edit");
          Route::put("/{studentOjt}/update", [AssignmentController::class, "update"])->name("update");
          Route::delete("/{studentOjt}/delete", [AssignmentController::class, "destroy"])->name("destroy");
        });

        Route::prefix("/student-ojts")->name("student-ojts.")->group(function () {
          Route::get("/", [StudentOjtController::class, "index"])->name("index");
          Route::get("/completed", [DashboardController::class, "completed"])->name("completed");
          Route::get("/students-at-risk", [DashboardController::class, "atRisk"])->name("students-at-risk");
          Route::get("/{studentOjt}/show", [StudentOjtController::class, "show"])->name("show");
        });

        Route::prefix("/reports")->name("reports.")->group(function () {
          Route::get("/", [ReportController::class, "index"])->name("index");
          Route::get("/create", [ReportController::class, "create"])->name("create");
          Route::post("/", [ReportController::class, "store"])->name("store");

          Route::get("/{report}/show", [ReportController::class, "show"])->name("show");
          Route::get("/{report}/edit", [ReportController::class, "edit"])->name("edit");
          Route::put("/{report}/update", [ReportController::class, "update"])->name("update");
          Route::delete("/{report}/delete", [ReportController::class, "destroy"])->name("destroy");
        });

        Route::prefix("/evaluations")->name("evaluations.")->group(function () {
          Route::get("/", [EvaluationController::class, "index"])->name("index");
          Route::get("/create", [EvaluationController::class, "create"])->name("create");
          Route::post("/", [EvaluationController::class, "store"])->name("store");
          Route::get("/{studentOjt}/show", [EvaluationController::class, "show"])->name("show");
          Route::get("/{studentOjt}/create", [EvaluationController::class, "create"])->name("create-for");
          Route::post("/{studentOjt}", [EvaluationController::class, "store"])->name("store-for");
          Route::get("/{studentOjt}/edit", [EvaluationController::class, "edit"])->name("edit");
          Route::put("/{studentOjt}/update", [EvaluationController::class, "update"])->name("update");
          Route::delete("/{studentOjt}/delete", [EvaluationController::class, "destroy"])->name("destroy");
        });

        Route::prefix("/attendance")->name("attendance.")->group(function () {
          Route::get("/", [AttendanceController::class, "index"])->name("index");
          Route::get("/present", [DashboardController::class, "present"])->name("present");
          Route::get("/absent", [DashboardController::class, "absent"])->name("absent");
          Route::get("/late", [DashboardController::class, "late"])->name("late");
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
        });
      });
    }
  });
});
