<?php

use App\Enums\UserRole;
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

      $table->string('username', 100)->nullable()->unique();
      $table->string('password');

      $table->binary('profile_picture')->nullable();

      $table->string('first_name', 100);
      $table->string('middle_name', 50)->nullable();
      $table->string('last_name', 50);
      $table->string('extension_name', 10)->nullable();

      $table->string('user_id', 50)->unique();

      $table->date('birth_date')->nullable();

      $table->enum('gender', ['Male', 'Female', 'Other'])->nullable();

      $table->string('home_address', 255)->nullable();
      $table->string('present_address', 255)->nullable();
      $table->string('contact_number', 15)->nullable();

      $table->string('email', 100)->nullable()->unique();
      $table->timestamp('email_verified_at')->nullable();

      $table->enum('role', UserRole::cases());

      $table->enum('status', ['pre_activated', 'active', 'suspended'])->default('pre_activated');
      $table->timestamp('activated_at')->nullable();

      $table->rememberToken();
      $table->softDeletes();
      $table->timestamps();

      $table->index('role');
      $table->index('status');
      $table->index('contact_number');
      $table->index(['role', 'status']);
      $table->index(['last_name', 'first_name']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void {
    Schema::dropIfExists('users');
  }
};
