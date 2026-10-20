@php
  $role = auth()->user()->role->value;
  $ojtField = \App\Enums\Fields\OjtField::class;
@endphp

@extends ("layouts.app")

@section ("title", "OJT Period Details")
@section ("header_title", "OJT Period Details")
@section ("header_edit_route", route("web.{$role}.ojts.edit", $ojt))
@section ("header_go_back", "")

@section ("header_description")
  Academic year and term details for this OJT period.
@endsection

@section ("content")
  <div class="mx-auto w-full max-w-6xl space-y-6">
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
            <h3 class="text-text text-sm font-semibold">Academic Information</h3>
          </div>
          <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
            <div class="min-w-0">
              <x-fields.ojt :field="$ojtField::ACADEMIC_YEAR" :ojt="$ojt" mode="view" />
            </div>
            <div class="min-w-0">
              <x-fields.ojt :field="$ojtField::TERM" :ojt="$ojt" mode="view" />
            </div>
            <div class="min-w-0 sm:col-span-2">
              <dt class="text-text-muted text-xs font-medium tracking-wider uppercase">
                Active Student Assignments
              </dt>
              <dd class="text-primary-700 mt-1 text-lg font-bold">
                {{ $ojt->student_ojts_count }}
              </dd>
            </div>
          </div>
        </section>
      </div>

      {{-- RIGHT COLUMN --}}
      <div class="space-y-6">
        {{-- SCHEDULE DETAILS --}}
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
            <h3 class="text-text text-sm font-semibold">Schedule Period</h3>
          </div>
          <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
            <div class="min-w-0">
              <dt class="text-text-muted text-xs font-medium tracking-wider uppercase">
                Start Date
              </dt>
              <dd class="text-text mt-1 text-sm font-medium">
                {{
                  $ojt->start_date?->format("M d, Y") ??
                    "—"
                }}
              </dd>
            </div>
            <div class="min-w-0">
              <dt class="text-text-muted text-xs font-medium tracking-wider uppercase">
                End Date
              </dt>
              <dd class="text-text mt-1 text-sm font-medium">
                {{
                  $ojt->end_date?->format("M d, Y") ??
                    "—"
                }}
              </dd>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
@endsection
  
