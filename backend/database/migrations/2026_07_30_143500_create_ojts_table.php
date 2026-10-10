<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::create('ojts', function (Blueprint $table) {
      $table->id();

      $table->string('academic_year', 20);
      $table->string('term', 20);
      $table->date('start_date');
      $table->date('end_date');

      $table->timestamps();

      $table->unique(['academic_year', 'term']);
      
      $table->index('academic_year');
      $table->index('start_date');
      $table->index('end_date');
      $table->index(['start_date', 'end_date']);
    });
  }

  public function down(): void {
    Schema::dropIfExists('ojts');
  }
};
