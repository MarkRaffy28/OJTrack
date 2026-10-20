<?php

use App\Enums\EvaluationStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::create('evaluation_details', function (Blueprint $table) {
      $table->id();
      $table->foreignId('evaluation_id')->constrained('evaluations')->cascadeOnDelete();
      $table->foreignId('evaluator_id')->constrained('users')->restrictOnDelete();
      $table->enum('evaluation_type', ['supervisor', 'instructor']);
      $table->enum('period', ['midterm', 'final'])->nullable();
      // A generated key makes supervisor (period NULL) unique on MySQL too.
      $table->string('period_key', 20)->storedAs("COALESCE(period, 'supervisor')");
      $table->json('criteria_scores')->nullable();
      $table->text('remarks')->nullable();
      $table->unsignedTinyInteger('total_points')->default(0);
      $table->string('status', 20)->default(EvaluationStatus::DRAFT->value);
      $table->timestamp('submitted_at')->nullable();
      $table->timestamps();

      $table->unique(['evaluation_id', 'evaluation_type', 'period_key'], 'eval_detail_slot_unique');
      $table->index(['evaluator_id', 'status'], 'eval_detail_evaluator_status_idx');
      $table->index(['evaluation_type', 'period'], 'eval_detail_type_period_idx');
    });
    DB::statement("ALTER TABLE evaluation_details ADD CONSTRAINT evaluation_details_type_period_check CHECK ((evaluation_type = 'supervisor' AND period IS NULL) OR (evaluation_type = 'instructor' AND period IS NOT NULL))");
  }

  public function down(): void {
    Schema::dropIfExists('evaluation_details');
  }
};
