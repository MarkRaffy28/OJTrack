@php
  $role = auth()->user()->role->value;
  $route = "web.{$role}.assignments.store";

  $studentOptions = $students->pluck("full_name", "id")->toArray();
  $supervisorOptions = $supervisors->pluck("full_name", "id")->toArray();
  $officeOptions = $offices->pluck("name", "id")->toArray();
@endphp

@extends ("layouts.app")

@section ("title", "Create Assignment")
@section ("header_title", "Create Assignment")
@section ("header_description",
  "Create a new student OJT assignment and assign the office, supervisor, schedule, and required hours.")
@section ("content")
  <div class="mx-auto max-w-4xl">
    <div class="bg-surface border-border overflow-hidden rounded-xl border shadow-sm">
      <x-form.form action="{{ route($route) }}">
        {{-- Fields --}}
        <div class="px-6 py-6">
          <div class="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <x-fields.assignment field="student_id" :options="$studentOptions" />
            <x-fields.assignment field="office_id" :options="$officeOptions" />
            <x-fields.assignment field="supervisor_id" :options="$supervisorOptions" />
            <x-fields.assignment
              field="academic_year"
              :value="$settings['academic_year'] ?? ''"
            />
            <x-fields.assignment field="term" :value="$settings['term'] ?? ''" />
            <x-fields.assignment
              field="required_hours"
              :value="$settings['required_hours'] ?? ''"
            />
            <x-fields.assignment field="status" />
            <x-fields.assignment
              field="start_date"
              :value="$settings['start_date'] ?? ''"
            />
            <x-fields.assignment field="end_date" :value="$settings['end_date'] ?? ''" />
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
      const supervisorSelect = $("#supervisor_id");
      const officeSupervisorMap = @json ($officeSupervisorMap);

      supervisorSelect.prop("disabled", true);
      supervisorSelect.closest("form").on("submit", function () {
        supervisorSelect.prop("disabled", false);
      });

      officeSelect.on("change", function () {
        const officeId = $(this).val();
        const supervisorId = officeSupervisorMap[officeId] || "";
        supervisorSelect.val(supervisorId).trigger("change");
      });

      if (!supervisorSelect.val()) {
        officeSelect.trigger("change");
      }
    });
  </script>
@endsection
