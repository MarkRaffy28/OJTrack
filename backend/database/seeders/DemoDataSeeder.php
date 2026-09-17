<?php

namespace Database\Seeders;

use App\Enums\EvaluationStatus;
use App\Enums\OjtStatus;
use App\Models\Attendance;
use App\Models\Evaluation;
use App\Models\Office;
use App\Models\ProgressReport;
use App\Models\Report;
use App\Models\StudentOjt;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $faker = fake();
        $offices = Office::all()->values();
        $supervisors = User::where('role', 'supervisor')->get()->values();
        for ($i = 1; $i <= 4; $i++) {
            $instructor = User::updateOrCreate(['user_id' => sprintf('INS-%04d', $i)], [
                'username' => 'instructor' . $i, 'password' => Hash::make('password'),
                'first_name' => $faker->firstName(), 'middle_name' => $faker->optional()->firstName(), 'last_name' => $faker->lastName(),
                'birth_date' => $faker->dateTimeBetween('-55 years', '-30 years')->format('Y-m-d'), 'gender' => $faker->randomElement(['Male', 'Female']),
                'home_address' => $faker->address(), 'present_address' => $faker->address(), 'contact_number' => '09' . $faker->numerify('#########'),
                'email' => sprintf('instructor%02d@ojtrack.test', $i), 'email_verified_at' => now(), 'role' => 'instructor', 'status' => 'active', 'activated_at' => now(),
            ]);
            $instructor->instructorDetail()->updateOrCreate([], ['department' => 'CCS', 'section' => $faker->randomElement(['A', 'B', 'C'])]);
        }
        $instructors = User::where('role', 'instructor')->with('instructorDetail')->get()->values();
        $today = Carbon::today();
        $termStart = Carbon::create(2026, 9, 1);
        $termEnd = Carbon::create(2027, 5, 31);

        $students = collect();
        for ($i = 1; $i <= 24; $i++) {
            $names = $i === 8
                ? ['first_name' => 'Rene', 'last_name' => 'Baterbonia']
                : ['first_name' => $faker->firstName(), 'last_name' => $faker->lastName()];
            $user = User::updateOrCreate(['user_id' => sprintf('STU-%04d', $i)], [
                'username' => $i === 1 ? 'student' : 'student' . $i,
                'password' => Hash::make('password'),
                'first_name' => $names['first_name'],
                'middle_name' => $faker->optional(0.55)->firstName(),
                'last_name' => $names['last_name'],
                'extension_name' => $faker->optional(0.08)->randomElement(['Jr.', 'III']),
                'birth_date' => $faker->dateTimeBetween('-25 years', '-18 years')->format('Y-m-d'),
                'gender' => $faker->randomElement(['Male', 'Female', 'Other']),
                'home_address' => $faker->address(),
                'present_address' => $faker->address(),
                'contact_number' => '09' . $faker->numerify('#########'),
                'email' => sprintf('student%02d@ojtrack.test', $i),
                'email_verified_at' => now(),
                'role' => 'student',
                'status' => 'active',
                'activated_at' => now(),
            ]);
            $user->studentDetail()->updateOrCreate([], [
                'year' => $faker->randomElement([3, 4]),
                'program' => 'BSIT',
                'major' => $faker->randomElement(['Web and Mobile Development', 'Network Administration', 'Database Systems']),
                'section' => $faker->randomElement(['A', 'B', 'C']),
                'instructor_detail_id' => $instructors->isNotEmpty() ? $instructors[($i - 1) % $instructors->count()]->instructorDetail?->id : null,
                'office_id' => $offices[($i - 1) % $offices->count()]->id,
            ]);
            $user->emergencyContacts()->updateOrCreate(['is_primary' => true], [
                'name' => $faker->name(), 'relationship' => $faker->randomElement(['Mother', 'Father', 'Guardian']),
                'contact_number' => '09' . $faker->numerify('#########'), 'address' => $faker->address(),
            ]);
            $students->push($user);
        }

        foreach ($students as $index => $student) {
            $pattern = $index % 8;
            $isCompleted = $pattern === 1;
            $isPending = $pattern === 2;
            $isDropped = $pattern === 3;
            $start = $isCompleted ? Carbon::create(2026, 1, 5) : $termStart->copy();
            $end = $isCompleted ? Carbon::create(2026, 5, 29) : $termEnd->copy();
            $status = $isCompleted ? OjtStatus::COMPLETED->value : ($isPending ? OjtStatus::PENDING->value : ($isDropped ? OjtStatus::DROPPED->value : OjtStatus::ONGOING->value));
            $office = $offices[$index % $offices->count()];
            $supervisor = $supervisors->isNotEmpty() ? $supervisors[$index % $supervisors->count()] : null;
            $ojt = StudentOjt::updateOrCreate([
                'student_id' => $student->id, 'academic_year' => '2026-2027', 'term' => '2nd',
            ], [
                'supervisor_id' => $supervisor?->id, 'office_id' => $office->id, 'required_hours' => $pattern === 4 ? 480 : 600,
                'status' => $status, 'start_date' => $start->toDateString(), 'end_date' => $end->toDateString(),
            ]);

            $this->seedAttendance($ojt, $student, $office, $start, $end, $pattern, $today);
            $this->seedReports($ojt, $student, $supervisor, $start, $pattern, $faker);
            $this->seedEvaluation($ojt, $pattern);
            $this->seedProgressReport($student, $supervisor, $pattern, $faker);
        }
    }

    private function seedAttendance(StudentOjt $ojt, User $student, Office $office, Carbon $start, Carbon $end, int $pattern, Carbon $today): void
    {
        $cursor = $start->copy();
        $last = $end->lessThan($today) ? $end : $today;
        while ($cursor->lessThanOrEqualTo($last)) {
            if ($cursor->isWeekday()) {
                $date = $cursor->toDateString();
                $absent = $pattern === 3 || ($pattern === 6 && $cursor->day % 5 === 0);
                $fields = ['ojt_id' => $ojt->id, 'morning_in' => null, 'morning_out' => null, 'afternoon_in' => null, 'afternoon_out' => null, 'morning_in_verified' => false, 'morning_out_verified' => false, 'afternoon_in_verified' => false, 'afternoon_out_verified' => false];
                if (!$absent) {
                    $late = $pattern === 0 || ($pattern === 7 && $cursor->day % 3 === 0);
                    $in = Carbon::parse($office->morning_in)->addMinutes($late ? 20 + ($cursor->day % 15) : 0);
                    $fields['morning_in'] = $in->format('H:i:s');
                    $fields['morning_in_verified'] = true;
                    if ($pattern !== 5) { $fields['morning_out'] = $office->morning_out; $fields['morning_out_verified'] = true; }
                    if ($pattern !== 4) { $fields['afternoon_in'] = $office->afternoon_in; $fields['afternoon_in_verified'] = true; $fields['afternoon_out'] = $pattern === 7 ? Carbon::parse($office->afternoon_out)->subMinutes(30)->format('H:i:s') : $office->afternoon_out; $fields['afternoon_out_verified'] = true; }
                }
                Attendance::updateOrCreate(['student_id' => $student->id, 'date' => $date], $fields);
            }
            $cursor->addDay();
        }
    }

    private function seedReports(StudentOjt $ojt, User $student, ?User $reviewer, Carbon $start, int $pattern, mixed $faker): void
    {
        foreach (['daily', 'weekly', $pattern % 3 === 0 ? 'midterm' : 'monthly'] as $offset => $type) {
            $date = $start->copy()->addDays($offset * 7);
            Report::updateOrCreate(['student_id' => $student->id, 'ojt_id' => $ojt->id, 'type' => $type, 'report_date' => $date->toDateString()], [
                'document_paths' => ['seeded/reports/' . $student->user_id . '-' . $type . '.pdf'],
                'status' => $pattern % 4 === 0 ? 'pending' : ($pattern % 4 === 1 ? 'approved' : 'rejected'),
                'reviewed_by' => $pattern % 4 === 0 ? null : $reviewer?->id,
                'reviewed_at' => $pattern % 4 === 0 ? null : now(), 'feedback' => $faker->optional(0.45)->sentence(),
            ]);
        }
    }

    private function seedEvaluation(StudentOjt $ojt, int $pattern): void
    {
        if ($pattern === 2 || $pattern === 3) return;
        $scores = array_map(fn () => 2 + (($pattern * 3) % 4), range(1, 5));
        Evaluation::updateOrCreate(['student_ojt_id' => $ojt->id], [
            'quality' => $scores[0], 'productivity' => $scores[1], 'initiative' => $scores[2], 'time_management_punctuality' => $scores[3], 'proper_attire_grooming' => $scores[4],
            'total_points' => array_sum($scores), 'remarks' => 'Seeded evaluation for demonstration.', 'status' => $pattern % 3 === 0 ? EvaluationStatus::DRAFT->value : EvaluationStatus::SUBMITTED->value, 'submitted_at' => $pattern % 3 === 0 ? null : now(),
        ]);
    }

    private function seedProgressReport(User $student, ?User $reviewer, int $pattern, mixed $faker): void
    {
        if (!Schema::hasTable('progress_reports')) return;
        $detail = $student->studentDetail;
        if (!$detail) return;
        ProgressReport::updateOrCreate(['student_id' => $detail->id, 'title' => 'Seeded weekly progress report'], [
            'content' => $faker->paragraph(), 'file_path' => 'seeded/progress/' . $student->user_id . '.pdf', 'status' => $pattern % 3 === 0 ? 'pending' : 'approved', 'reviewed_by' => $pattern % 3 === 0 ? null : $reviewer?->id, 'remarks' => $faker->optional()->sentence(), 'submitted_at' => now()->subDays($pattern), 'reviewed_at' => $pattern % 3 === 0 ? null : now(),
        ]);
    }
}
