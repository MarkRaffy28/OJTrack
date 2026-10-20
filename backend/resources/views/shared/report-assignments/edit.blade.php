@php
  $role = auth()->user()->role->value;
  $route = "web.{$role}.report-assignments.update";

  $ojtOptions = $ojts
    ->map(
      fn($ojt) => [
        "value" => $ojt->id,
        "label" => $ojt->academic_year . " - " . $ojt->term->value,
      ],
    )
    ->all();
@endphp

@extends ("layouts.app")

@section ("title", "Edit Report Assignment")

@section ("header_title", "Edit Report Assignment")

@section ("header_go_back", "")

@section ("header_description")
  Update the published report submission details and configuration.
@endsection

@section ("content")
  <div class="mx-auto w-full max-w-6xl">
    <x-form.form method="POST" action="{{ route($route, $assignment) }}">
      @method ("PUT")

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
                >edit_square</span
              >
            </div>

            <div class="min-w-0 flex-1">
              <h2 class="text-text truncate text-lg font-semibold">
                {{ $assignment->title }}
              </h2>
            </div>
          </div>
        </div>

        {{-- TWO-COLUMN LAYOUT --}}
        <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          {{-- LEFT COLUMN --}}
          <div class="space-y-6">
            {{-- ASSIGNMENT DETAILS --}}
            <section
              class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
            >
              <div
                class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
              >
                <span
                  class="material-symbols-outlined material-symbols-md text-primary-600"
                  aria-hidden="true"
                  >assignment</span
                >
                <h2 class="text-text text-sm font-semibold">Assignment Details</h2>
              </div>
              <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
                <div class="min-w-0 sm:col-span-2">
                  <x-fields.report-assignment
                    field="title"
                    :value="old('title', $assignment->title)"
                  />
                </div>
                <div class="min-w-0 sm:col-span-2">
                  <x-fields.report-assignment
                    field="ojt_id"
                    :options="$ojtOptions"
                    :value="old('ojt_id', $assignment->ojt_id)"
                  />
                </div>
              </div>
            </section>
          </div>

          {{-- RIGHT COLUMN --}}
          <div class="space-y-6">
            {{-- SCHEDULE & OPTIONS --}}
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
                <h2 class="text-text text-sm font-semibold">Schedule & Options</h2>
              </div>
              <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
                <div class="min-w-0 sm:col-span-2">
                  <x-fields.report-assignment
                    field="type"
                    :options="$types"
                    :value="old('type', $assignment->type->value)"
                  />
                </div>
                <div class="min-w-0 sm:col-span-2">
                  <x-fields.report-assignment
                    field="due_at"
                    :value="old('due_at', $assignment->due_at?->format('Y-m-d\TH:i'))"
                  />
                </div>
                <div class="min-w-0 pt-2 sm:col-span-2">
                  <label class="text-text flex items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      name="allow_late_submission"
                      value="1"
                      @checked (old("allow_late_submission", $assignment->allow_late_submission))
                      class="border-border text-primary-600 focus:ring-primary-500 h-4 w-4 rounded"
                    />
                    Allow late submissions
                  </label>
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
            href="{{ route("web.{$role}.report-assignments.index") }}"
            class="border-border bg-surface text-text hover:bg-background inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
          >
            Cancel
          </a>

          <x-form.submit />
        </div>
      </div>
    </x-form.form>
  </div>
@endsection
