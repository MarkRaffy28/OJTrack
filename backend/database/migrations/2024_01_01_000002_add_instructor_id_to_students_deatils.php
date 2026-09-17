<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * ASSUMPTION: your student_details table doesn't already have an
 * instructor_detail_id column, and instructor_details.id is its PK.
 * Verify against your actual StudentDetail/InstructorDetail migrations.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('users') || ! Schema::hasTable('student_details') || ! Schema::hasTable('instructor_details')) {
            return;
        }

        if (! Schema::hasColumn('student_details', 'instructor_detail_id')) {
            Schema::table('student_details', function (Blueprint $table) {
                $table->foreignId('instructor_detail_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('instructor_details')
                    ->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('student_details') && Schema::hasColumn('student_details', 'instructor_detail_id')) {
            Schema::table('student_details', function (Blueprint $table) {
                $table->dropConstrainedForeignId('instructor_detail_id');
            });
        }
    }
};