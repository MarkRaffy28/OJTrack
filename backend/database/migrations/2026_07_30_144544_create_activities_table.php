<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  /**
   * Run the migrations.
   */
  public function up(): void {
    Schema::create('activities', function (Blueprint $table) {
      $table->id();

      $table->foreignId('user_id')
        ->constrained('users')
        ->cascadeOnDelete();

      $table->foreignId('ojt_id')
        ->nullable()
        ->constrained('student_ojts')
        ->nullOnDelete();

      $table->string('action', 50);
      $table->unsignedBigInteger('target_id')->nullable();
      $table->string('target_type', 50)->nullable();
      $table->text('description')->nullable();

      $table->timestamps();

      $table->index('user_id');
      $table->index('ojt_id');
      $table->index('action');
      $table->index('created_at');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void {
    Schema::dropIfExists('activities');
  }
};
