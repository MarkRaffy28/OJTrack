@php
  /** @var \App\Models\ReportAssignment $reportAssignment */
  $role = auth()->user()->role->value;
  $isPublished = $reportAssignment->is_published;

  $statusClasses = $isPublished
    ? "bg-success-50 text-success-700"
    : "bg-warning-50 text-warning-700";

  $statusDot = $isPublished ? "bg-success-500" : "bg-warning-500";
@endphp

@extends ("layouts.app")

@section ("title", "View Report Assignment")

@section ("header_title", $reportAssignment->title)

@section ("header_description", "View assignment details and submitted reports.")

@section ("header_go_back", "")

@section ("header_edit_route",
  route("web.{$role}.report-assignments.edit", $reportAssignment))

@section ("content")
  <div class="mx-auto w-full max-w-6xl space-y-6">
    {{-- HERO HEADER --}}
    <div class="border-border bg-surface rounded-2xl border p-6 shadow-sm">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <div
            class="bg-primary-50 text-primary-600 flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
          >
            <span class="material-symbols-outlined material-symbols-md" aria-hidden="true"
              >assignment</span
            >
          </div>
          <div class="min-w-0">
            <h2 class="text-text truncate text-lg font-semibold">
              {{ $reportAssignment->title }}
            </h2>
            <p class="text-text-muted truncate text-sm">
              {{
                ucfirst(
                  $reportAssignment->type?->value ?? "Assignment",
                )
              }} · Created by {{
                $reportAssignment->creator?->full_name ??
                  "System"
              }}
            </p>
          </div>
        </div>

        <span
          class="{{ $statusClasses }} inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
        >
          <span class="{{ $statusDot }} h-1.5 w-1.5 rounded-full"></span>
          {{
            $isPublished
              ? "Published"
              : "Draft / Scheduled"
          }}
        </span>
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
              >info</span
            >
            <h3 class="text-text text-sm font-semibold">Assignment Information</h3>
          </div>
          <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
            <div class="min-w-0 sm:col-span-2">
              <dt class="text-text-muted text-xs font-medium tracking-wider uppercase">
                Title
              </dt>
              <dd class="text-text mt-1 text-sm font-semibold">
                {{ $reportAssignment->title }}
              </dd>
            </div>
            <div class="min-w-0">
              <dt class="text-text-muted text-xs font-medium tracking-wider uppercase">
                Type
              </dt>
              <dd class="text-text mt-1 text-sm">
                {{
                  ucfirst(
                    $reportAssignment->type?->value ?? "Assignment",
                  )
                }}
              </dd>
            </div>
            <div class="min-w-0">
              <dt class="text-text-muted text-xs font-medium tracking-wider uppercase">
                Created By
              </dt>
              <dd class="text-text mt-1 text-sm">
                {{
                  $reportAssignment->creator?->full_name ??
                    "—"
                }}
              </dd>
            </div>
          </div>
        </section>
      </div>

      {{-- RIGHT COLUMN --}}
      <div class="space-y-6">
        {{-- SCHEDULE & TARGET --}}
        <section
          class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
        >
          <div
            class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
          >
            <span
              class="material-symbols-outlined material-symbols-md text-primary-600"
              aria-hidden="true"
              >event</span
            >
            <h3 class="text-text text-sm font-semibold">Schedule & Cohort</h3>
          </div>
          <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
            <div class="min-w-0">
              <dt class="text-text-muted text-xs font-medium tracking-wider uppercase">
                OJT Cohort
              </dt>
              <dd class="text-text mt-1 text-sm">
                {{
                  $reportAssignment->ojt?->academic_year ??
                    "—"
                }}
                @if ($reportAssignment->ojt?->term)
                  · {{
                    $reportAssignment->ojt->term
                      ->value
                  }}
                @endif
              </dd>
            </div>
            <div class="min-w-0">
              <dt class="text-text-muted text-xs font-medium tracking-wider uppercase">
                Due Date
              </dt>
              <dd class="text-text mt-1 text-sm">
                {{
                  $reportAssignment->due_at?->format(
                    "F j, Y g:i A",
                  ) ?? "—"
                }}
              </dd>
            </div>
            <div class="min-w-0 sm:col-span-2">
              <dt class="text-text-muted text-xs font-medium tracking-wider uppercase">
                Status
              </dt>
              <dd class="text-text mt-1 text-sm font-medium">
                {{
                  $isPublished
                    ? "Published"
                    : "Draft / Scheduled"
                }}
              </dd>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
@endsection
