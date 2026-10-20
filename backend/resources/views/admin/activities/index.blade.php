@php
  /** @var \Illuminate\Contracts\Pagination\LengthAwarePaginator $activities */

  $role = auth()->user()->role->value;
@endphp

@extends ("layouts.app")

@section ("title", "Activity Logs")
@section ("header_title", "Activity Logs")
@section ("header_description",
  "Monitor system activities, user actions, and audit logs.")

@section ("header_show_cohort_selector", "")

@section ("header_filters")
  <x-search-filter :filters="$filters" :showSearch="false" :showDateRange="true" />
@endsection

@section ("content")
  <div class="space-y-4">
    <div class="border-border bg-surface overflow-hidden rounded-xl border shadow-sm">
      <div class="overflow-x-auto">
        <x-table :headers="$headers">
          @forelse ($activities as $activity)
            <x-table.row :model="$activity" routePrefix="activities">
              <x-table.cell> {{ $activity->id }} </x-table.cell>

              <x-table.cell>
                {{
                  $activity->created_at
                    ? $activity->created_at->format("M j, Y g:i A")
                    : "N/A"
                }}
              </x-table.cell>

              <x-table.cell :model="$activity->actor">
                {{
                  $activity->actor?->full_name ??
                    "Unknown User"
                }}
              </x-table.cell>

              <x-table.cell>
                <span
                  class="bg-surface-secondary inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                >
                  {{
                    ucfirst(
                      str_replace("_", " ", $activity->action->value ?? $activity->action),
                    )
                  }}
                </span>
              </x-table.cell>

              <x-table.cell>
                {{
                  $activity->subject_type
                    ? class_basename($activity->subject_type) . " (#{$activity->subject_id})"
                    : "N/A"
                }}
              </x-table.cell>

              <x-table.cell>
                {{
                  $activity->description ??
                    "No description provided."
                }}
              </x-table.cell>

              <x-table.actions
                :model="$activity"
                :actions="['view']"
                routePrefix="activities"
              />
            </x-table.row>
          @empty
            <x-table.empty-state
              message="No activity logs found."
              :colspan="count($headers)"
            />
          @endforelse
        </x-table>
      </div>
    </div>

    <div>
      <x-pagination :paginator="$activities" />
    </div>
  </div>
@endsection
