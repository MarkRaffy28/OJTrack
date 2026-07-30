<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
	/**
	 * Run the migrations.
	 */
	public function up(): void {
		Schema::create('offices', function (Blueprint $table) {
			$table->string('name', 150);
			$table->string('address', 255)->nullable();
			$table->string('contact_email', 150)->nullable();
			$table->string('contact_phone', 20)->nullable();

			$table->time('morning_in')->default('08:00:00');
			$table->time('morning_out')->default('12:00:00');
			$table->time('afternoon_in')->default('13:00:00');
			$table->time('afternoon_out')->default('17:00:00');

			$table->softDeletes();
			$table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 */
	public function down(): void {
		Schema::dropIfExists('offices');
	}
};
