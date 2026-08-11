<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  /**
   * Run the migrations.
   */
  public function up(): void {
    Schema::create('users', function (Blueprint $table) {
      $table->id();

      $table->string('username', 100)->unique();
      $table->string('password');

      $table->binary('profile_picture')->nullable();

      $table->string('first_name', 100);
      $table->string('middle_name', 50)->nullable();
      $table->string('last_name', 50);
      $table->string('extension_name', 10)->nullable();

      $table->string('user_id', 50)->unique();

      $table->date('birth_date');

      $table->enum('gender', ['Male', 'Female', 'Other']);

      $table->string('address', 255);
      $table->string('contact_number', 15);

      $table->string('email', 100)->unique();
      $table->timestamp('email_verified_at')->nullable();

      $table->enum('role', ['student', 'instructor', 'supervisor', 'admin']);

      $table->enum('status', ['pre_activated', 'active', 'suspended'])->default('pre_activated');
      $table->timestamp('activated_at')->nullable();

      $table->rememberToken();
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void {
    Schema::dropIfExists('users');
  }
};
