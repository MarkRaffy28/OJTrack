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

      $table->foreignId('report_assignment_id')
        ->constrained('report_assignments')
        ->cascadeOnDelete();


      $table->foreignId('student_id')
        ->constrained('users')
        ->cascadeOnDelete();

      $table->foreignId('ojt_id')
        ->constrained('student_ojts')
        ->cascadeOnDelete();

      $table->date('report_date');
      $table->json('document_paths')->nullable();
      $table->boolean('is_late')->default(false);

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

      $table->unique([
        'report_assignment_id',
        'student_id',
      ]);

      $table->index('student_id');
      $table->index('ojt_id');
      $table->index('report_assignment_id');
      $table->index('status');
      $table->index('reviewed_by');
      $table->index('report_date');
      $table->index(['ojt_id', 'status']);
      $table->index(['student_id', 'report_assignment_id']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void {
    Schema::dropIfExists('reports');
  }
};
