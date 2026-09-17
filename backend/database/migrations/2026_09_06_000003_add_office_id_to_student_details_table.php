<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('student_details') || Schema::hasColumn('student_details', 'office_id')) {
            return;
        }

        Schema::table('student_details', function (Blueprint $table) {
            $table->foreignId('office_id')
                ->nullable()
                ->after('instructor_detail_id')
                ->constrained('offices')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        if (Schema::hasTable('student_details') && Schema::hasColumn('student_details', 'office_id')) {
            Schema::table('student_details', function (Blueprint $table) {
                $table->dropConstrainedForeignId('office_id');
            });
        }
    }
};