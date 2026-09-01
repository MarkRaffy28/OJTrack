<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\EmailVerificationController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {

  Route::post('/login', [AuthController::class, 'login']);

  Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('/register')->group(function () {
      Route::post('/student', [AuthController::class, 'registerStudent']);
      Route::post('/supervisor', [AuthController::class, 'registerSupervisor']);
    });

    Route::prefix('/email')->group(function () {
      Route::post('/verification-code', [EmailVerificationController::class, 'send']);
      Route::post('/verify', [EmailVerificationController::class, 'verify']);
    });

    Route::get('/me', [AuthController::class, 'me']);

    Route::post('/logout', [AuthController::class, 'logout']);
  });

});

Route::prefix('profile')->group(function () {
  Route::middleware('auth:sanctum')->group(function () {
    Route::patch('/emergency-contact', [ProfileController::class, 'updateEmergencyContact']);
    Route::patch('/personal-information', [ProfileController::class, 'updatePersonalInformation']);

    Route::post('/profile-picture', [ProfileController::class, 'updateProfilePicture']);
  });
});