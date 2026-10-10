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
      $table->nullableMorphs('subject');
      $table->text('description')->nullable();

      $table->timestamps();

      $table->index(['user_id', 'created_at']);
      $table->index(['ojt_id', 'created_at']);
      $table->index(['action', 'created_at']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void {
    Schema::dropIfExists('activities');
  }
};
