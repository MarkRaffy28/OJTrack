@php
  $role = auth()->user()->role->value;
  $editing = $ojt->exists;
  $action = $editing
    ? route("web.{$role}.ojts.update", $ojt)
    : route("web.{$role}.ojts.store");
@endphp

@extends ("layouts.app")

@section ("title", $editing ? "Edit OJT Period" : "Create OJT Period")

@section ("header_title", $editing ? "Edit OJT Period" : "Create OJT Period")

@section ("header_go_back", "")

@section ("header_description")
  Define the academic year, term, and schedule for an OJT period.
@endsection

@section ("content")
  <div class="mx-auto w-full max-w-6xl">
    <x-form.form action="{{ $action }}" method="{{ $editing ? 'PUT' : 'POST' }}">
      <div class="space-y-6">
        {{-- TWO-COLUMN LAYOUT --}}
        <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          {{-- LEFT COLUMN --}}
          <div class="space-y-6">
            {{-- ACADEMIC DETAILS --}}
            <section
              class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
            >
              <div
                class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
              >
                <span
                  class="material-symbols-outlined material-symbols-md text-primary-600"
                  aria-hidden="true"
                  >school</span
                >
                <h2 class="text-text text-sm font-semibold">Academic Details</h2>
              </div>
              <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
                <div class="min-w-0 sm:col-span-2">
                  <x-form.input
                    name="academic_year"
                    label="Academic Year"
                    value="{{ old('academic_year', $ojt->academic_year) }}"
                    placeholder="e.g. 2026-2027"
                    required
                  />
                </div>
                <div class="min-w-0 sm:col-span-2">
                  <x-form.select
                    name="term"
                    label="Term"
                    :options="$terms"
                    :value="old('term', $ojt->term?->value)"
                    placeholder="Select term"
                    required
                  />
                </div>
              </div>
            </section>
          </div>

          {{-- RIGHT COLUMN --}}
          <div class="space-y-6">
            {{-- SCHEDULE DATES --}}
            <section
              class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
            >
              <div
                class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
              >
                <span
                  class="material-symbols-outlined material-symbols-md text-primary-600"
                  aria-hidden="true"
                  >date_range</span
                >
                <h2 class="text-text text-sm font-semibold">Schedule Period</h2>
              </div>
              <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
                <div class="min-w-0 sm:col-span-2">
                  <x-form.input
                    name="start_date"
                    label="Start Date"
                    type="date"
                    value="{{ old('start_date', $ojt->start_date?->format('Y-m-d')) }}"
                    required
                  />
                </div>
                <div class="min-w-0 sm:col-span-2">
                  <x-form.input
                    name="end_date"
                    label="End Date"
                    type="date"
                    value="{{ old('end_date', $ojt->end_date?->format('Y-m-d')) }}"
                    required
                  />
                </div>
              </div>
            </section>
          </div>
        </div>

        {{-- ACTIONS --}}
        <div
          class="border-border bg-surface flex items-center justify-end gap-3 rounded-2xl border p-4 shadow-sm"
        >
          <a
            href="{{ route("web.{$role}.ojts.index") }}"
            class="border-border bg-surface text-text hover:bg-background inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
          >
            Cancel
          </a>

          <x-form.submit :text="$editing ? 'Update Period' : 'Create Period'" />
        </div>
      </div>
    </x-form.form>
  </div>
@endsection
