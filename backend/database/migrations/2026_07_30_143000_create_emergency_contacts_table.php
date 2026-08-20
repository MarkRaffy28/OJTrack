<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  /**
   * Run the migrations.
   */
  public function up(): void {
    Schema::create('emergency_contacts', function (Blueprint $table) {
      $table->id();

      $table->foreignId('user_id')
        ->constrained('users')
        ->cascadeOnDelete();

      $table->string('name', 210);
      $table->string('relationship', 50);
      $table->string('contact_number', 15);
      $table->string('address', 255);
      $table->boolean('is_primary')->default(true);

      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void {
    Schema::dropIfExists('emergency_contacts');
  }
};
