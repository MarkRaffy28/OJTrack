@php
  /** @var \Illuminate\Support\Collection $offices */
  /** @var \Illuminate\Support\Collection $sections */
  /** @var \Illuminate\Contracts\Pagination\LengthAwarePaginator $reports */
  $currentRole = auth()->user()->role->value;
@endphp

@extends ("layouts.app")

@section ("title",
  isset($currentSection)
    ? "{$currentProgram} - {$currentSection} Reports"
    : (isset($office)
      ? "{$office->name} Reports"
      : "Reports"))
@section ("header_title",
  isset($currentSection)
    ? "{$currentProgram} - {$currentSection}"
    : (isset($office)
      ? $office->name
      : (isset($allOffices) && $allOffices
        ? "All Offices"
        : "Reports")))
@section ("header_description",
  isset($currentSection)
    ? "Manage student OJT reports for this section."
    : (isset($office) || isset($allOffices)
      ? "Select a section to view reports."
      : "Select an office to get started."))

@section ("header_show_cohort_selector", "")

@if (isset($reports))
  @section ("header_print", "")
  @section ("header_create_route", route("web.{$currentRole}.reports.create"))
  @section ("header_create_button_text", "Create Report")
  @section ("header_filters")
    <x-search-filter :filters="$filters" :showSearch="false" :showDateRange="true" />
  @endsection
@endif

@section ("content")
  @if (isset($offices))
    {{-- Level 1: Office List Cards --}}
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      @if ($totalReportsCount > 0)
        <x-selectable-card
          icon="domain"
          title="All Offices"
          subtitle="View reports across all offices"
          :id="1"
          param="all_offices"
          :count="$totalReportsCount"
          countLabel="report"
        />
      @endif

      @forelse ($offices as $item)
        <x-selectable-card
          icon="domain"
          :title="$item['office']->name"
          :subtitle="$item['office']->address ?? null"
          :id="$item['office']->id"
          param="office_id"
          :count="$item['reports_count']"
          countLabel="report"
        />
      @empty
        <x-empty-state
          icon="business"
          title="No offices found"
          description="There are no offices available to display."
        />
      @endforelse
    </div>
  @elseif (isset($sections))
    {{-- Level 2: Section List Cards (for selected office) --}}
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      @if ($totalOfficeReportsCount > 0)
        <x-selectable-card
          icon="folder"
          title="All Sections"
          subtitle="View reports across all sections"
          :id="1"
          param="all_sections"
          :queryParams="
            request()->has('office_id')
              ? ['office_id' => request()->query('office_id')]
              : ['all_offices' => 1]
          "
          :count="$totalOfficeReportsCount"
          countLabel="report"
        />
      @endif

      @forelse ($sections as $item)
        <x-selectable-card
          icon="group"
          :title="$item['label']"
          subtitle="View reports for this section"
          :id="$item['section']"
          param="section"
          :queryParams="
            array_merge(
              request()->has('office_id')
                ? ['office_id' => request()->query('office_id')]
                : ['all_offices' => 1],
              ['program' => $item['program']],
            )
          "
          :count="$item['reports_count'] ?? 0"
          countLabel="report"
        />
      @empty
        <x-empty-state
          icon="folder_open"
          title="No sections found"
          description="There are no student sections available for this office."
        />
      @endforelse
    </div>
  @else
    {{-- Level 3: Reports Table --}}
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
                :actions="['view', 'edit', 'delete', 'restore']"
                deleteLabel="{{ $report->student?->full_name ?? 'Student' }}'s report"
              />
            </x-table.row>
          @empty
            <x-table.empty-state message="No reports found." :colspan="count($headers)" />
          @endforelse
        </x-table>
      </div>
    </div>

    <div class="mt-4 print:hidden">
      <x-pagination :paginator="$reports" />
    </div>
  @endif
@endsection

@if (isset($reports))
  @push ("styles")
    <style>
      @media print {
        body * {
          visibility: hidden;
        }

        main,
        main * {
          visibility: visible;
        }

        main {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
      }
    </style>
  @endpush
@endif
