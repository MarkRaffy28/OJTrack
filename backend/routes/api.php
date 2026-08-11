<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {

  Route::post('/login', [AuthController::class, 'login']);

  Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('/register')->group(function () {
      Route::post('/student', [AuthController::class, 'registerStudent']);
      Route::post('/supervisor', [AuthController::class, 'registerSupervisor']);
    });

    Route::get('/me', [AuthController::class, 'me']);

    Route::post('/logout', [AuthController::class, 'logout']);

  });

});