<?php

namespace Database\Seeders;

use App\Enums\AcademicMajor;
use App\Enums\AcademicProgram;
use App\Enums\EvaluationStatus;
use App\Enums\OjtStatus;
use App\Models\Attendance;
use App\Models\Evaluation;
use App\Models\EvaluationDetail;
use App\Models\Office;
use App\Models\ProgressReport;
use App\Models\Report;
use App\Models\ReportAssignment;
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
            $instructor->instructorDetail()->updateOrCreate([], [
                'program' => $faker->randomElement(AcademicProgram::cases())->value,
                'department' => 'CCS',
                'section' => $faker->randomElement(['A', 'B', 'C']),
            ]);
        }
        $instructors = User::where('role', 'instructor')->with('instructorDetail')->get()->values();
        $today = Carbon::today();
        $termStart = Carbon::create(2026, 9, 1);
        $termEnd = Carbon::create(2027, 5, 31);

        $students = collect();
        for ($i = 1; $i <= 24; $i++) {
            $names =['first_name' => $faker->firstName(), 'last_name' => $faker->lastName()];

            $user = User::updateOrCreate(['user_id' => sprintf('STU-%04d', $i)], [
                'username' => 'student' . $i,
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
                'program' => $faker->randomElement(AcademicProgram::cases())->value,
                'major' => $faker->randomElement(AcademicMajor::cases())->value,
                'section' => $faker->randomElement(['A', 'B', 'C']),
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
            $period = \App\Models\Ojt::firstOrCreate([
                'academic_year' => '2026-2027', 'term' => '2nd',
            ], ['start_date' => '2026-09-01', 'end_date' => '2027-05-31']);
            $ojt = StudentOjt::updateOrCreate([
                'student_id' => $student->id, 'ojt_id' => $period->id,
            ], [
                'instructor_id' => $instructors->isNotEmpty() ? $instructors[$index % $instructors->count()]->id : null,
                'office_id' => $office->id, 'required_hours' => $pattern === 4 ? 480 : 600,
                'status' => $status,
            ]);

            $reportAssignments = collect([
                ['type' => 'daily', 'title' => 'Daily OJT Report', 'days' => 1],
                ['type' => 'weekly', 'title' => 'Weekly OJT Report', 'days' => 7],
                ['type' => 'monthly', 'title' => 'Monthly OJT Report', 'days' => 30],
                ['type' => 'terminal', 'title' => 'Terminal OJT Report', 'days' => 120],
            ])->mapWithKeys(function (array $assignment) use ($period) {
                return [$assignment['type'] => ReportAssignment::updateOrCreate(
                    ['ojt_id' => $period->id, 'title' => $assignment['title']],
                    [
                        'created_by' => User::whereIn('role', ['admin', 'super-admin'])->value('id'),
                        'type' => $assignment['type'],
                        'due_at' => $period->start_date->copy()->addDays($assignment['days'])->endOfDay(),
                        'allow_late_submission' => true,
                        'published_at' => now(),
                    ],
                )];
            });

            $this->seedAttendance($ojt, $student, $office, $start, $end, $pattern, $today);
            $this->seedReports($ojt, $student, $supervisor, $start, $pattern, $faker, $reportAssignments);
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

    private function seedReports(StudentOjt $ojt, User $student, ?User $reviewer, Carbon $start, int $pattern, mixed $faker, $assignments): void
    {
        foreach ($assignments as $assignment) {
            $date = $start->copy();
            Report::updateOrCreate(['report_assignment_id' => $assignment->id, 'student_id' => $student->id], [
                'ojt_id' => $ojt->id,
                'report_date' => $date->toDateString(),
                'document_paths' => ['seeded/reports/' . $student->user_id . '-' . $assignment->type->value . '.pdf'],
                'is_late' => $pattern % 5 === 0,
                'status' => $pattern % 4 === 0 ? 'pending' : ($pattern % 4 === 1 ? 'approved' : 'rejected'),
                'reviewed_by' => $pattern % 4 === 0 ? null : $reviewer?->id,
                'reviewed_at' => $pattern % 4 === 0 ? null : now(), 'feedback' => $faker->optional(0.45)->sentence(),
            ]);
        }
    }

    private function seedEvaluation(StudentOjt $ojt, int $pattern): void
    {
        $evaluation = Evaluation::updateOrCreate(['student_ojt_id' => $ojt->id]);
        $supervisorId = $ojt->supervisor?->id
            ?? User::where('role', 'admin')->value('id')
            ?? User::where('role', 'instructor')->value('id');
        $instructorId = $ojt->instructor_id
            ?? User::where('role', 'instructor')->value('id')
            ?? User::where('role', 'admin')->value('id');

        foreach ([
            ['type' => 'supervisor', 'period' => null, 'evaluator_id' => $supervisorId],
            ['type' => 'instructor', 'period' => 'midterm', 'evaluator_id' => $instructorId],
            ['type' => 'instructor', 'period' => 'final', 'evaluator_id' => $instructorId],
        ] as $slot) {
            $scores = [
                'quality' => min(40, 28 + $pattern),
                'productivity' => min(20, 14 + ($pattern % 5)),
                'initiative' => min(20, 14 + ($pattern % 5)),
                'timeManagementPunctuality' => min(10, 7 + ($pattern % 4)),
                'properAttireGrooming' => min(10, 7 + ($pattern % 4)),
            ];
            $status = $pattern % 3 === 0
                ? EvaluationStatus::DRAFT->value
                : ($slot['period'] === 'final' && $pattern % 4 === 0
                    ? EvaluationStatus::FINALIZED->value
                    : EvaluationStatus::SUBMITTED->value);

            EvaluationDetail::updateOrCreate(
                ['evaluation_id' => $evaluation->id, 'evaluation_type' => $slot['type'], 'period' => $slot['period']],
                [
                    'evaluator_id' => $slot['evaluator_id'],
                    'criteria_scores' => $scores,
                    'total_points' => array_sum($scores),
                    'remarks' => 'Seeded evaluation for demonstration.',
                    'status' => $status,
                    'submitted_at' => $status === EvaluationStatus::DRAFT->value ? null : now(),
                ],
            );
        }
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
