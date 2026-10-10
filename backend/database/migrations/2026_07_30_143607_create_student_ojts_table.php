<?php

use App\Enums\OjtStatus;
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

      $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
      $table->foreignId('ojt_id')->constrained('ojts')->restrictOnDelete();
      $table->foreignId('instructor_id')->nullable()->constrained('users')->nullOnDelete();
      $table->foreignId('office_id')->constrained()->restrictOnDelete();

      $table->decimal('required_hours', 5, 2);
      $table->string('status', 20)->default(OjtStatus::PENDING->value);
      $table->json('report_deadlines')->nullable(); 

      $table->softDeletes();
      $table->timestamps();

      $table->unique(['student_id', 'ojt_id']);
      $table->index('student_id');
      $table->index('ojt_id');
      $table->index('instructor_id');
      $table->index('office_id');
      $table->index('status');
      $table->index(['office_id', 'ojt_id']);
      $table->index(['status', 'ojt_id']);
      $table->index(['instructor_id', 'ojt_id']);
      $table->index(['student_id', 'status']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void {
    Schema::dropIfExists('student_ojts');
  }
};
