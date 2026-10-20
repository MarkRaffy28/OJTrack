@php
  /** @var \Illuminate\Contracts\Pagination\LengthAwarePaginator $assignments */
@endphp

@extends ("layouts.app")

@section ("title", "Report Assignments")
@section ("header_title", "Report Assignments")
@section ("header_description", "Published report submissions by OJT cohort.")

@section ("header_show_cohort_selector", "")
@section ("header_create_route", route("web.{$currentRole}.report-assignments.create"))

@section ("header_filters")
  <x-search-filter :filters="$filters" :showSearch="true" :showDateRange="false" />
@endsection

@section ("content")
  <div class="border-border bg-surface overflow-hidden rounded-xl border shadow-sm">
    <div class="overflow-x-auto">
      <x-table :headers="$headers">
        @forelse ($assignments as $assignment)
          <x-table.row :model="$assignment">
            <x-table.cell> {{ $assignment->id }} </x-table.cell>

            <x-table.cell alignment="left">
              <span class="text-text font-medium">{{ $assignment->title }}</span>
            </x-table.cell>

            <x-table.cell>
              {{
                ucfirst(
                  $assignment->type?->value ?? "Assignment",
                )
              }}
            </x-table.cell>

            <x-table.cell>
              {{
                $assignment->due_at?->format("F j, Y g:i A") ??
                  "—"
              }}
            </x-table.cell>

            <x-table.cell>
              {{
                $assignment->published_at?->format(
                  "F j, Y g:i A",
                ) ?? "Draft"
              }}
            </x-table.cell>

            <x-table.cell alignment="left" :model="$assignment->creator">
              {{
                $assignment->creator?->full_name ??
                  "-"
              }}
            </x-table.cell>

            <x-table.actions
              :model="$assignment"
              :actions="['view', 'edit', 'delete', 'restore']"
              deleteLabel="{{ $assignment->title }} assignment"
            />
          </x-table.row>
        @empty
          <x-table.empty-state
            message="No report assignments found."
            :colspan="count($headers)"
          />
        @endforelse
      </x-table>
    </div>
  </div>

  <div class="mt-4 print:hidden">
    <x-pagination :paginator="$assignments" />
  </div>
@endsection
