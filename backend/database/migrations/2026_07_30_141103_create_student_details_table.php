<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  /**
   * Run the migrations.
   */
  public function up(): void {
    Schema::create('student_details', function (Blueprint $table) {
      $table->id();

      $table->foreignId('student_id')
        ->unique()
        ->constrained('users')
        ->cascadeOnDelete();

      $table->unsignedTinyInteger('year');
      $table->string('program', 100);
      $table->string('major', 100);
      $table->string('section', 10);

      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void {
    Schema::dropIfExists('student_details');
  }
};
