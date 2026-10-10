@php
  $role = auth()->user()->role->value;
  $route = "web.{$role}.assignments.update";

  $studentOptions = $students
    ->mapWithKeys(fn($student) => [$student->id => $student->full_name])
    ->toArray();

  $ojtOptions = $ojts->mapWithKeys(fn($ojt) => [$ojt->id => $ojt->academic_year . ' / ' . $ojt->term->value])->toArray();

  $officeOptions = $offices->pluck("name", "id")->toArray();
@endphp

@extends ("layouts.app")

@section ("title", "Edit Assignment")

@section ("header_title", "Edit Assignment")

@section ("header_description", "Update the details of the assignment below.")

@section ("content")
  <div class="mx-auto max-w-4xl">
    <div class="bg-surface border-border overflow-hidden rounded-xl border shadow-sm">
      {{-- Header --}}

      <x-form.form method="PUT" action="{{ route($route, $studentOjt) }}">
        {{-- Fields --}}
        <div class="px-6 py-6">
          <div class="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <x-fields.assignment
              field="student_id"
              :value="$studentOjt->student_id"
              :options="$studentOptions"
            />

            <x-fields.assignment
              field="office_id"
              :value="$studentOjt->office_id"
              :options="$officeOptions"
            />

            <x-fields.assignment
              field="ojt_id"
              :value="$studentOjt->ojt_id"
              :options="$ojtOptions"
            />

            <x-fields.assignment
              field="required_hours"
              :value="$studentOjt->required_hours"
            />

            <x-fields.assignment field="status" :value="$studentOjt->status->value" />

            <div class="sm:col-span-2"><h3 class="text-sm font-semibold text-gray-700">Report Deadlines</h3><p class="text-xs text-gray-500">Set the deadlines for daily, weekly, and monthly reports.</p></div>
            <div><label for="daily_deadline" class="block text-sm font-medium text-gray-700">Daily Deadline</label><input id="daily_deadline" name="report_deadlines[daily]" type="date" value="{{ old('report_deadlines.daily', $studentOjt->report_deadlines['daily'] ?? '') }}" class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"></div>
            <div><label for="weekly_deadline" class="block text-sm font-medium text-gray-700">Weekly Deadline</label><input id="weekly_deadline" name="report_deadlines[weekly]" type="date" value="{{ old('report_deadlines.weekly', $studentOjt->report_deadlines['weekly'] ?? '') }}" class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"></div>
            <div><label for="monthly_deadline" class="block text-sm font-medium text-gray-700">Monthly Deadline</label><input id="monthly_deadline" name="report_deadlines[monthly]" type="date" value="{{ old('report_deadlines.monthly', $studentOjt->report_deadlines['monthly'] ?? '') }}" class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"></div>
          </div>
        </div>

        {{-- Footer --}}
        <div
          class="border-border bg-background/60 flex items-center justify-between border-t px-6 py-4"
        >
          <a
            href="{{ route("web.{$role}.assignments.index") }}"
            class="border-border bg-surface text-text hover:bg-background rounded-md border px-4 py-2 text-sm font-medium transition"
          >
            Cancel
          </a>

          <x-form.submit />
        </div>
      </x-form.form>
    </div>
  </div>

  <script>
    $(function () {
      const officeSelect = $("#office_id");
    });
  </script>
@endsection
