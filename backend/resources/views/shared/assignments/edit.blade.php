@php
  $role = auth()->user()->role->value;
  $route = "web.{$role}.assignments.update";

  $studentOptions = $students
    ->mapWithKeys(fn($student) => [$student->id => $student->full_name])
    ->toArray();

  $supervisorOptions = $supervisors
    ->mapWithKeys(fn($supervisor) => [$supervisor->id => $supervisor->full_name])
    ->toArray();

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
              field="supervisor_id"
              :value="$studentOjt->supervisor_id"
              :options="$supervisorOptions"
            />

            <x-fields.assignment
              field="academic_year"
              :value="$studentOjt->academic_year"
            />

            <x-fields.assignment field="term" :value="$studentOjt->term->value" />

            <x-fields.assignment
              field="required_hours"
              :value="$studentOjt->required_hours"
            />

            <x-fields.assignment field="status" :value="$studentOjt->status->value" />

            <x-fields.assignment
              field="start_date"
              :value="$studentOjt->start_date->format('Y-m-d')"
            />

            <x-fields.assignment
              field="end_date"
              :value="$studentOjt->end_date->format('Y-m-d')"
            />
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
