<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  /**
   * Run the migrations.
   */
  public function up(): void {
    Schema::create('instructor_details', function (Blueprint $table) {
      $table->id();

      $table->foreignId('instructor_id')
        ->unique()
        ->constrained('users')
        ->cascadeOnDelete();

      $table->string('department', 100)->default('CCS');
      $table->string('section', 10);

      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void {
    Schema::dropIfExists('instructor_details');
  }
};
