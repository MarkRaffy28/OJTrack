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

      $table->unsignedTinyInteger('quality');
      $table->unsignedTinyInteger('productivity');
      $table->unsignedTinyInteger('initiative');
      $table->unsignedTinyInteger('time_management_punctuality');
      $table->unsignedTinyInteger('proper_attire_grooming');

      $table->text('remarks')->nullable();

      $table->unsignedTinyInteger('total_points')->default(0);

      $table->string('status', 20)
        ->default(EvaluationStatus::DRAFT->value);

      $table->timestamp('submitted_at')->nullable();

      $table->timestamps();

      $table->unique('student_ojt_id');

      $table->index('status');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void {
    Schema::dropIfExists('evaluations');
  }
};