<?php

use App\Enums\EvaluationStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  /**
   * Run the migrations.
   */
  public function up(): void {
    Schema::create('evaluations', function (Blueprint $table) {
      $table->id();

      $table->foreignId('student_ojt_id')
        ->constrained('student_ojts')
        ->cascadeOnDelete();

      $table->foreignId('evaluator_id')
        ->constrained('users');

      $table->json('criteria_scores')->nullable();

      $table->text('remarks')->nullable();

      $table->unsignedTinyInteger('total_points')->default(0);

      $table->string('status', 20)
        ->default(EvaluationStatus::DRAFT->value);

      $table->timestamp('submitted_at')->nullable();

      $table->timestamps();

      $table->unique('student_ojt_id');
      $table->index('evaluator_id');
      $table->index('status');
      $table->index('submitted_at');
      $table->index(['evaluator_id', 'status']);
      $table->index(['status', 'submitted_at']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void {
    Schema::dropIfExists('evaluations');
  }
};
