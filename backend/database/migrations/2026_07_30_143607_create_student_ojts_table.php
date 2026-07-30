<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  /**
   * Run the migrations.
   */
  public function up(): void {
    Schema::create('student_ojts', function (Blueprint $table) {
      $table->id();

      $table->foreignId('student_id')
        ->constrained('users')
        ->cascadeOnDelete();

      $table->foreignId('supervisor_id')
        ->nullable()
        ->constrained('users')
        ->nullOnDelete();

      $table->foreignId('office_id')
        ->constrained()
        ->cascadeOnDelete();

      $table->string('academic_year', 20);

      $table->enum('term', ['1st', '2nd', 'Summer']);

      $table->decimal('required_hours', 5, 2);
      $table->decimal('rendered_hours', 5, 2)->default(0);

      $table->enum('status', [
        'pending',
        'ongoing',
        'completed',
        'dropped',
      ])->default('pending');

      $table->date('start_date');
      $table->date('end_date');

      $table->softDeletes();
      $table->timestamps();

      $table->index(['student_id', 'academic_year', 'term']);
      $table->index(['supervisor_id', 'academic_year', 'term']);
      $table->index(['office_id', 'academic_year', 'term']);
      $table->index(['status', 'academic_year', 'term']);
      $table->index(['academic_year', 'term']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void {
    Schema::dropIfExists('student-ojts');
  }
};
