<?php

use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EmailVerificationController;
use App\Http\Controllers\Api\EvaluationController;
use App\Http\Controllers\Api\OjtController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReportController;
use Illuminate\Support\Facades\Route;

// Authentication
Route::prefix('auth')->group(function () {

  // Public authentication routes
  Route::middleware('throttle:auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);

    Route::prefix('forgot-password')->group(function () {
      Route::post('/', [AuthController::class, 'forgotPassword']);
      Route::post('/verify', [AuthController::class, 'verifyForgotPassword']);
    });

    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
  });

  // Authenticated authentication routes
  Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {

    Route::middleware('throttle:sensitive')->group(function () {
      Route::prefix('register')->group(function () {
        Route::post('/student', [AuthController::class, 'registerStudent']);
        Route::post('/supervisor', [AuthController::class, 'registerSupervisor']);
      });

      Route::prefix('email')->group(function () {
        Route::post('/verification-code', [EmailVerificationController::class, 'send']);
        Route::post('/verify', [EmailVerificationController::class, 'verify']);
      });

      Route::patch('/password', [AuthController::class, 'changePassword']);
    });

    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
  });

});

// Attendance
Route::prefix('attendance')
  ->middleware(['auth:sanctum', 'throttle:api'])
  ->group(function () {

    Route::get('/today', [AttendanceController::class, 'today']);
    Route::get('/', [AttendanceController::class, 'index']);
    Route::get('/{id}', [AttendanceController::class, 'show']);

    Route::middleware('throttle:sensitive')->group(function () {
      Route::post('/manual', [AttendanceController::class, 'submitManual']);
      Route::get('/supervisor/qr', [AttendanceController::class, 'supervisorQr']);
      Route::post('/qr', [AttendanceController::class, 'submitQr']);
      Route::post('/{id}/approve', [AttendanceController::class, 'approve']);
    });
  });

// OJT
Route::prefix('ojt')
  ->middleware(['auth:sanctum', 'throttle:api'])
  ->group(function () {

    Route::get('/', [OjtController::class, 'show']);
    Route::get('/all', [OjtController::class, 'index']);
    Route::get('/{id}', [OjtController::class, 'showById']);
  });

// Profile
Route::prefix('profile')
  ->middleware(['auth:sanctum', 'throttle:api'])
  ->group(function () {

    Route::middleware('throttle:sensitive')->group(function () {
      Route::patch('/emergency-contact', [ProfileController::class, 'updateEmergencyContact']);
      Route::patch('/personal-information', [ProfileController::class, 'updatePersonalInformation']);
      Route::post('/profile-picture', [ProfileController::class, 'updateProfilePicture']);
    });
  });

// Reports
Route::prefix('reports')
  ->middleware(['auth:sanctum', 'throttle:api'])
  ->group(function () {

    // Read operations
    Route::get('/assignments', [ReportController::class, 'assignments']);
    Route::get('/templates', [ReportController::class, 'templates']);
    Route::get('/', [ReportController::class, 'index']);
    Route::get('/{id}', [ReportController::class, 'show']);

    // Write operations
    Route::middleware('throttle:sensitive')->group(function () {
      Route::post('/', [ReportController::class, 'store']);
      Route::patch('/{id}', [ReportController::class, 'update']);
      Route::post('/{id}/review', [ReportController::class, 'review']);
      Route::delete('/{id}', [ReportController::class, 'destroy']);
    });
  });

// Dashboard
Route::prefix('dashboard')
  ->middleware(['auth:sanctum', 'throttle:api'])
  ->group(function () {

    Route::get('/student', [DashboardController::class, 'student']);
    Route::get('/supervisor', [DashboardController::class, 'supervisor']);
  });

// Evaluations
Route::prefix('evaluations')
  ->middleware(['auth:sanctum', 'throttle:api'])
  ->group(function () {

    Route::get('/{ojtId}', [EvaluationController::class, 'show']);

    Route::middleware('throttle:sensitive')->group(function () {
      Route::put('/{ojtId}', [EvaluationController::class, 'save']);
      Route::post('/{ojtId}/submit', [EvaluationController::class, 'submit']);
      Route::post('/{ojtId}/finalize', [EvaluationController::class, 'finalize']);
    });
  });
