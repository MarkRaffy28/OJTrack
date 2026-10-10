@php
  $role = auth()->user()->role->value;
  $route = "web.{$role}.assignments.store";

  $studentOptions = $students->pluck("full_name", "id")->toArray();
  $ojtOptions = $ojts
    ->mapWithKeys(fn($ojt) => [$ojt->id => $ojt->academic_year . " / " . $ojt->term->value])
    ->toArray();
  $officeOptions = $offices->pluck("name", "id")->toArray();
@endphp

@extends ("layouts.app")

@section ("title", "Create Assignment")
@section ("header_title", "Create Assignment")
@section ("header_description",
  "Create a new student OJT assignment and assign the office and OJT period.")
@section ("content")
  <div class="mx-auto max-w-4xl">
    <div class="bg-surface border-border overflow-hidden rounded-xl border shadow-sm">
      <x-form.form action="{{ route($route) }}">
        {{-- Fields --}}
        <div class="px-6 py-6">
          <div class="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <x-fields.assignment field="student_id" :options="$studentOptions" />
            <x-fields.assignment
              field="office_id"
              :options="$officeOptions"
              :value="request()->query('office_id')"
            />
            <x-fields.assignment field="ojt_id" :options="$ojtOptions" />
            <x-fields.assignment
              field="required_hours"
              :value="$settings['required_hours'] ?? ''"
            />
            <x-fields.assignment field="status" />
            <div class="sm:col-span-2">
              <h3 class="text-sm font-semibold text-gray-700">Report Deadlines</h3>
              <p class="text-xs text-gray-500">Set the deadlines for daily, weekly, and monthly reports.</p>
            </div>
            <div>
              <label for="daily_deadline" class="block text-sm font-medium text-gray-700"
                >Daily Deadline</label
              ><input
                id="daily_deadline"
                name="report_deadlines[daily]"
                type="date"
                class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label for="weekly_deadline" class="block text-sm font-medium text-gray-700"
                >Weekly Deadline</label
              ><input
                id="weekly_deadline"
                name="report_deadlines[weekly]"
                type="date"
                class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label
                for="monthly_deadline"
                class="block text-sm font-medium text-gray-700"
                >Monthly Deadline</label
              ><input
                id="monthly_deadline"
                name="report_deadlines[monthly]"
                type="date"
                class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {{-- Footer --}}
        <div
          class="border-border bg-background/60 flex items-center justify-between border-t px-6 py-4"
        >
          <a
            href="{{ route("web.{$role}.assignments.index") }}"
            class="border-border bg-surface text-text hover:bg-background inline-flex items-center gap-1.5 rounded-md border px-4 py-2 text-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
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
