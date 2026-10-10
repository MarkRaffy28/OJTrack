@php
  /** @var \Illuminate\Database\Eloquent\Collection<int, \App\Models\Report> $reports */
@endphp

@extends ("layouts.app")

@section ("title", "Reports")
@section ("header_title", "Reports")
@section ("header_description", "Manage OJT reports and supporting files.")

@section ("header_print", "")
@section ("header_create_route", route("web.{$currentRole}.reports.create"))

@section ("header_filters")
  <x-search-filter :filters="$filters" :showSearch="false" />
@endsection

@section ("content")
  <div class="border-border bg-surface overflow-hidden rounded-xl border shadow-sm">
    <div class="overflow-x-auto">
      <x-table :headers="$headers">
        @forelse ($reports as $report)
          <x-table.row :model="$report">
            <x-table.cell> {{ $report->id }} </x-table.cell>

            <x-table.cell alignment="left" :model="$report->student">
              {{
                $report->student?->full_name ??
                  "Unknown student"
              }}
            </x-table.cell>

            <x-table.cell alignment="left" :model="$report->ojt?->office">
              {{
                $report->ojt?->office?->name ??
                  "Unknown Office"
              }}
            </x-table.cell>

            <x-table.cell>{{
              ucfirst(
                $report->type?->value ?? "Report",
              )
            }}</x-table.cell>

            <x-table.cell>{{
              $report->report_date?->format("F j, Y") ??
                "—"
            }}</x-table.cell>

            <x-table.cell>
              <span class="text-text-muted inline-flex items-center gap-1"
                ><span class="material-symbols-outlined text-sm">attach_file</span>{{
                  count(
                    $report->document_paths ?? [],
                  )
                }}</span
              >
            </x-table.cell>

            <x-table.cell>
              {{
                ucfirst(
                  $report->status?->value ?? "Unknown",
                )
              }}
            </x-table.cell>

            <x-table.cell>
              {{
                $report->reviewer?->full_name ??
                  "-"
              }}
            </x-table.cell>

            <x-table.actions
              :model="$report"
              :actions="['view', 'edit', 'delete']"
              deleteLabel="{{ $report->student?->full_name }}'s report"
            />
          </x-table.row>
        @empty
          <x-table.empty-state message="No reports found." :colspan="6" />
        @endforelse
      </x-table>
    </div>
  </div>
  <x-pagination :paginator="$reports" />
@endsection
