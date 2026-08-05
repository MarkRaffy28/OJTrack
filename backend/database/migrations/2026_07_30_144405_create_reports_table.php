<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  /**
   * Run the migrations.
   */
  public function up(): void {
    Schema::create('reports', function (Blueprint $table) {
      $table->id();

      $table->foreignId('student_id')
        ->constrained('users')
        ->cascadeOnDelete();

      $table->foreignId('ojt_id')
        ->constrained('student_ojts')
        ->cascadeOnDelete();

      $table->enum('type', [
        'daily',
        'weekly',
        'monthly',
        'midterm',
        'final',
        'incident',
      ]);

      $table->date('report_date');

      $table->json('document_paths')->nullable();

      $table->enum('status', [
        'pending',
        'approved',
        'rejected',
      ])->default('pending');

      $table->foreignId('reviewed_by')
        ->nullable()
        ->constrained('users')
        ->nullOnDelete();

      $table->timestamp('reviewed_at')->nullable();
      $table->text('feedback')->nullable();

      $table->softDeletes();
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void {
    Schema::dropIfExists('reports');
  }
};
