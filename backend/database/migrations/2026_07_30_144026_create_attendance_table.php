<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  /**
   * Run the migrations.
   */
  public function up(): void {
    Schema::create('attendance', function (Blueprint $table) {
      $table->id();

      $table->foreignId('student_id')
        ->constrained('users')
        ->cascadeOnDelete();

      $table->foreignId('ojt_id')
        ->constrained('student_ojts')
        ->cascadeOnDelete();

      $table->date('date');

      $table->time('morning_in')->nullable();
      $table->boolean('morning_in_verified')->default(false);

      $table->time('morning_out')->nullable();
      $table->boolean('morning_out_verified')->default(false);

      $table->time('afternoon_in')->nullable();
      $table->boolean('afternoon_in_verified')->default(false);

      $table->time('afternoon_out')->nullable();
      $table->boolean('afternoon_out_verified')->default(false);

      $table->timestamps();

      $table->unique(['student_id', 'date']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void {
    Schema::dropIfExists('attendance');
  }
};
