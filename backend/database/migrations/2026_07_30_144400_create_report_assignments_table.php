<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  /**
   * Run the migrations.
   */
  public function up(): void {
    Schema::create('report_assignments', function (Blueprint $table) {
      $table->id();

      $table->foreignId('ojt_id')
        ->constrained('ojts')
        ->restrictOnDelete();

      $table->foreignId('created_by')
        ->constrained('users')
        ->restrictOnDelete();

      $table->string('title');
      $table->enum('type', [
        'daily',
        'weekly',
        'monthly',
        'terminal',
      ]);

      $table->timestamp('due_at')->nullable();

      $table->boolean('allow_late_submission')->default(false);

      $table->timestamp('published_at')->nullable();

      $table->timestamps();
      $table->softDeletes();

      $table->index(['ojt_id', 'published_at']);
      $table->index('due_at');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void {
    Schema::dropIfExists('report_assignments');
  }
};
