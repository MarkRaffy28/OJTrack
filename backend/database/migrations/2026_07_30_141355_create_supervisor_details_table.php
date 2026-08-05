<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  /**
   * Run the migrations.
   */
  public function up(): void {
    Schema::create('supervisor_details', function (Blueprint $table) {
      $table->id();

      $table->foreignId('user_id')
        ->unique()
        ->constrained('users')
        ->cascadeOnDelete();

      $table->foreignId('office_id')
        ->constrained('offices')
        ->cascadeOnDelete();

      $table->string('position', 255);

      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void {
    Schema::dropIfExists('supervisor_details');
  }
};
