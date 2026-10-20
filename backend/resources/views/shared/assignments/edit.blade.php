@php
  $role = auth()->user()->role->value;
  $route = "web.{$role}.assignments.update";

  $studentOptions = $students
    ->mapWithKeys(fn($student) => [$student->id => $student->full_name])
    ->toArray();

  $instructorOptions = $instructors
    ->mapWithKeys(
      fn($instructor) => [
        $instructor->id =>
          $instructor->full_name .
          ($instructor->instructorDetail?->section
            ? " ({$instructor->instructorDetail->program->name}-{$instructor->instructorDetail->section})"
            : ""),
      ],
    )
    ->toArray();

  $officeOptions = $offices->pluck("name", "id")->toArray();
  $ojtOptions = $ojts
    ->mapWithKeys(fn($ojt) => [$ojt->id => $ojt->academic_year . " / " . $ojt->term->value])
    ->toArray();
@endphp

@extends ("layouts.app")

@section ("title", "Edit Assignment")

@section ("header_title", "Edit Assignment")

@section ("header_go_back", "")

@section ("header_description")
  Update the details of the selected student assignment below.
@endsection

@section ("content")
  <div class="mx-auto w-full max-w-6xl">
    <x-form.form method="PUT" action="{{ route($route, $studentOjt) }}">
      <div class="space-y-6">
        {{-- HERO HEADER --}}
        <div class="border-border bg-surface rounded-2xl border p-6 shadow-sm">
          <div class="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div
              class="bg-primary-50 text-primary-600 flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
            >
              <span
                class="material-symbols-outlined material-symbols-md"
                aria-hidden="true"
                >assignment</span
              >
            </div>

            <div class="min-w-0 flex-1">
              <h2 class="text-text truncate text-lg font-semibold">
                {{
                  $studentOjt->student
                    ->full_name
                }}
              </h2>
              <p class="text-text-muted truncate text-sm">
                {{
                  $studentOjt->office->name ??
                    "Unassigned Office"
                }}
              </p>
            </div>
          </div>
        </div>

        {{-- TWO-COLUMN LAYOUT --}}
        <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          {{-- PEOPLE & PLACEMENT --}}
          <section
            class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
          >
            <div
              class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
            >
              <span
                class="material-symbols-outlined material-symbols-md text-primary-600"
                aria-hidden="true"
                >group</span
              >
              <h2 class="text-text text-sm font-semibold">People & Placement</h2>
            </div>
            <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
              <div class="min-w-0 sm:col-span-2">
                <x-fields.assignment
                  field="student_id"
                  :value="$studentOjt->student_id"
                  :options="$studentOptions"
                />
              </div>
              <div class="min-w-0 sm:col-span-2">
                <x-fields.assignment
                  field="instructor_id"
                  :value="$studentOjt->instructor_id"
                  :options="$instructorOptions"
                />
              </div>
              <div class="min-w-0 sm:col-span-2">
                <x-fields.assignment
                  field="office_id"
                  :value="$studentOjt->office_id"
                  :options="$officeOptions"
                />
              </div>
            </div>
          </section>

          {{-- PROGRAM & STATUS --}}
          <section
            class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
          >
            <div
              class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
            >
              <span
                class="material-symbols-outlined material-symbols-md text-primary-600"
                aria-hidden="true"
                >tune</span
              >
              <h2 class="text-text text-sm font-semibold">Program & Requirements</h2>
            </div>
            <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
              <div class="min-w-0 sm:col-span-2">
                <x-fields.assignment
                  field="ojt_id"
                  :value="$studentOjt->ojt_id"
                  :options="$ojtOptions"
                />
              </div>
              <div class="min-w-0">
                <x-fields.assignment
                  field="required_hours"
                  :value="$studentOjt->required_hours"
                />
              </div>
              <div class="min-w-0">
                <x-fields.assignment field="status" :value="$studentOjt->status->value" />
              </div>
            </div>
          </section>
        </div>

        {{-- ACTIONS --}}
        <div
          class="border-border bg-surface flex items-center justify-end gap-3 rounded-2xl border p-4 shadow-sm"
        >
          <a
            href="{{ route("web.{$role}.assignments.index") }}"
            class="border-border bg-surface text-text hover:bg-background inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
          >
            Cancel
          </a>

          <x-form.submit />
        </div>
      </div>
    </x-form.form>
  </div>

  <script>
    $(function () {
      const officeSelect = $("#office_id");
    });
  </script>
@endsection
