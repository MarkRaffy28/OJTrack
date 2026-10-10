@php
  /** @var \Illuminate\Database\Eloquent\Collection<int, \App\Models\Office> $offices */
@endphp

@extends ("layouts.app")

@section ("title", isset($office) ? "{$office->name} - Assignments" : "Assignments")
@section ("header_title", isset($office) ? $office->name : "Assignments")
@section ("header_description",
  isset($office)
    ? "Manage student OJT assignments for this office."
    : "Manage student OJT assignments.")

@if (!isset($offices))
  @section ("header_print", "")
  @section ("header_create_route",
    route(
      "web.{$currentRole}.assignments.create",
      request()->query("office_id") ? ["office_id" => request()->query("office_id")] : []
    ))

  @section ("header_filters")
    <x-search-filter :filters="$filters" />
  @endsection
@endif

@section ("content")
  @if (isset($offices))
    {{-- Office selection --}}
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      @forelse ($offices as $office)
        <x-selectable-card
          icon="business"
          :title="$office->name"
          :subtitle="$office->address ?? null"
          :id="$office->id"
          param="office_id"
          :count="$office->non_completed_students_count"
          countLabel="assigned student"
        />
      @empty
        <x-empty-state
          icon="business"
          title="No offices found"
          description="There are no offices available to display."
        />
      @endforelse
    </div>
  @else
    <div class="space-y-4">
      {{-- Table --}}
      <x-table :headers="$headers">
        @forelse ($studentOjts as $studentOjt)
          <x-table.row :model="$studentOjt" routePrefix="assignments">
            <x-table.cell> {{ $studentOjt->id }} </x-table.cell>

            <x-table.cell :model="$studentOjt->student">
              {{
                $studentOjt->student->full_name ??
                  "Unknown User"
              }}
            </x-table.cell>

            <x-table.cell :model="$studentOjt->supervisor">
              {{
                $studentOjt->supervisor?->full_name ??
                  "Unassigned"
              }}
            </x-table.cell>

            <x-table.cell> {{ $studentOjt->cohort }} </x-table.cell>

            <x-table.cell> {{ $studentOjt->status->label() }}</x-table.cell>

            <x-table.actions
              :model="$studentOjt"
              :actions="['view', 'edit', 'delete']"
              routePrefix="assignments"
              :deleteLabel="($studentOjt->student->full_name ?? 'Student') . '\'s record'"
            />
          </x-table.row>
        @empty
          <x-table.empty-state
            message="No assignments found for this office."
            :colspan="count($headers)"
          />
        @endforelse
      </x-table>

      {{-- Pagination --}}
      <div class="print:hidden">
        <x-pagination :paginator="$studentOjts" />
      </div>
    </div>
  @endif
@endsection

@if (!isset($offices))
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
