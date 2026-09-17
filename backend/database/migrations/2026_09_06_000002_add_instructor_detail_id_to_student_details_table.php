<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('student_details') || Schema::hasColumn('student_details', 'instructor_detail_id')) {
            return;
        }

        Schema::table('student_details', function (Blueprint $table) {
            $table->foreignId('instructor_detail_id')
                ->nullable()
                ->after('section')
                ->constrained('instructor_details')
                ->nullOnDelete();
        });
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
