@php
  /** @var \Illuminate\Support\Collection $offices */
  /** @var \Illuminate\Support\Collection $sections */
  /** @var \Illuminate\Contracts\Pagination\LengthAwarePaginator $attendances */

  $role = auth()->user()->role->value;

  $slotGroups = [
    "Morning" => [
      "morning_in" => "In",
      "morning_out" => "Out",
    ],
    "Afternoon" => [
      "afternoon_in" => "In",
      "afternoon_out" => "Out",
    ],
  ];
@endphp

@extends ("layouts.app")

@section ("title",
  isset($currentSection)
    ? "{$currentProgram} - {$currentSection} Attendance Logs"
    : (isset($office)
      ? "{$office->name} Attendance Logs"
      : "Attendance Logs"))
@section ("header_title",
  isset($currentSection)
    ? "{$currentProgram} - {$currentSection}"
    : (isset($office)
      ? $office->name
      : (isset($allOffices) && $allOffices
        ? "All Offices"
        : "Attendance Logs")))
@section ("header_description",
  isset($currentSection)
    ? "Manage OJT attendance records and time approvals for this section."
    : (isset($office) || isset($allOffices)
      ? "Select a section to view attendance logs."
      : "Select an office to get started."))

@section ("header_show_cohort_selector", "")

@if (isset($attendances))
  @section ("header_print", "")
  @section ("header_create_route",
    route(
      "web.{$role}.attendance.create",
      array_filter([
        "office_id" => request()->query("office_id"),
        "program" => request()->query("program"),
        "section" => request()->query("section")
      ])
    ))
    
  @section ("header_create_button_text", "Log Attendance")
  @section ("header_filters")
    <x-search-filter :filters="$filters" :showSearch="false" :showDateRange="true" />
  @endsection
@endif

@section ("content")
  @if (isset($offices))
    {{-- Level 1: Office List Cards --}}
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      @if ($totalAttendancesCount > 0)
        <x-selectable-card
          icon="domain"
          title="All Offices"
          subtitle="View attendance records across all offices"
          :id="1"
          param="all_offices"
          :count="$totalAttendancesCount"
          countLabel="record"
        />
      @endif

      @forelse ($offices as $item)
        <x-selectable-card
          icon="domain"
          :title="$item['office']->name"
          :subtitle="$item['office']->address ?? null"
          :id="$item['office']->id"
          param="office_id"
          :count="$item['attendances_count']"
          countLabel="record"
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
      @if ($totalOfficeAttendancesCount > 0)
        <x-selectable-card
          icon="folder"
          title="All Sections"
          subtitle="View attendance records across all sections"
          :id="1"
          param="all_sections"
          :queryParams="
            request()->has('office_id')
    ? ['office_id' => request()->query('office_id')]
    : ['all_offices' => 1]
          "
          :count="$totalOfficeAttendancesCount"
          countLabel="record"
        />
      @endif

      @forelse ($sections as $item)
        <x-selectable-card
          icon="group"
          :title="$item['label']"
          subtitle="View attendance records for this section"
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
          :count="$item['attendances_count'] ?? 0"
          countLabel="record"
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
    {{-- Level 3: Attendance Table View --}}
    <div class="space-y-4">
      {{-- Info banner note --}}
      <x-alert type="info" class="print:hidden">
        <strong>Note:</strong> Attendance is permitted on weekdays (Mon–Fri). Rendered
        hours count <strong>only approved</strong> morning and afternoon sessions. Toggle
        each of the <strong>4 session slots</strong> individually, or use
        <strong>Toggle All 4</strong> to approve/unapprove all at once.
      </x-alert>

      <div class="border-border bg-surface overflow-hidden rounded-xl border shadow-sm">
        <div class="overflow-x-auto">
          <x-table :headers="$headers">
            @forelse ($attendances as $attendance)
              <x-table.row :model="$attendance" routePrefix="attendance">
                <x-table.cell> {{ $attendance->id }} </x-table.cell>

                <x-table.cell :model="$attendance->student">
                  {{
                    $attendance->student?->full_name ??
                      "Unknown Student"
                  }}
                </x-table.cell>

                <x-table.cell>
                  {{
                    $attendance->date
                      ? $attendance->date->format("l, F j, Y")
                      : "N/A"
                  }}
                </x-table.cell>

                {{-- Morning Session --}}
                <x-table.cell>
                  <div class="flex items-center gap-1 whitespace-nowrap">
                    @foreach (["morning_in" => "In", "morning_out" => "Out"] as $slot => $label)
                      @php
                        $time = $attendance->{$slot};
                        $verified = $attendance->{"{$slot}_verified"};
                      @endphp
                      <form
                        method="POST"
                        action="{{ route("web.{$role}.attendance.toggle-slot", [$attendance, $slot]) }}"
                        class="inline print:hidden"
                      >
                        @csrf
                        @method ("PATCH")
                        <button
                          type="submit"
                          @disabled (!$time)
                          title="{{ $time ? "Toggle Morning {$label} approval" : "No time logged for Morning {$label}" }}"
                          @class ([
                            "inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs transition-colors",
                            "text-text-subtle/50 cursor-not-allowed" => !$time,
                            "hover:bg-surface-secondary" => $time,
                            "text-text-subtle" => $time && !$verified
                          ])
                        >
                          <span class="text-text-subtle">{{ $label }}</span>
                          <span class="font-medium">{{
                            $time
                              ? \Carbon\Carbon::parse($time)->format("g:i A")
                              : "--:--"
                          }}</span>
                          <span
                            @class ([
                              "material-symbols-outlined text-[14px] leading-none",
                              "text-success-600" => $time && $verified,
                              "text-warning-500" => $time && !$verified
                            ])
                            >{{
                              $verified
                                ? "check_circle"
                                : "pending"
                            }}</span
                          >
                        </button>
                      </form>
                    @endforeach
                  </div>
                </x-table.cell>

                {{-- Afternoon Session --}}
                <x-table.cell>
                  <div class="flex items-center gap-1 whitespace-nowrap">
                    @foreach (["afternoon_in" => "In", "afternoon_out" => "Out"] as $slot => $label)
                      @php
                        $time = $attendance->{$slot};
                        $verified = $attendance->{"{$slot}_verified"};
                      @endphp
                      <form
                        method="POST"
                        action="{{ route("web.{$role}.attendance.toggle-slot", [$attendance, $slot]) }}"
                        class="inline print:hidden"
                      >
                        @csrf
                        @method ("PATCH")
                        <button
                          type="submit"
                          @disabled (!$time)
                          title="{{ $time ? "Toggle Afternoon {$label} approval" : "No time logged for Afternoon {$label}" }}"
                          @class ([
                            "inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs transition-colors",
                            "text-text-subtle/50 cursor-not-allowed" => !$time,
                            "hover:bg-surface-secondary" => $time,
                            "text-text-subtle" => $time && !$verified
                          ])
                        >
                          <span class="text-text-subtle">{{ $label }}</span>
                          <span class="font-medium">{{
                            $time
                              ? \Carbon\Carbon::parse($time)->format("g:i A")
                              : "--:--"
                          }}</span>
                          <span
                            @class ([
                              "material-symbols-outlined text-[14px] leading-none",
                              "text-success-600" => $time && $verified,
                              "text-warning-500" => $time && !$verified
                            ])
                            >{{
                              $verified
                                ? "check_circle"
                                : "pending"
                            }}</span
                          >
                        </button>
                      </form>
                    @endforeach
                  </div>
                </x-table.cell>

                <x-table.cell :model="$attendance->ojt?->office">
                  {{
                    $attendance->ojt?->office?->name ??
                      "Unassigned"
                  }}
                </x-table.cell>

                <x-table.cell :model="$attendance->ojt?->supervisor">
                  {{
                    $attendance->ojt?->supervisor?->full_name ??
                      "Unassigned"
                  }}
                </x-table.cell>

                <x-table.cell>
                  <div class="flex flex-col items-center whitespace-nowrap">
                    {{
                      number_format(
                        $attendance->approved_hours,
                        1,
                      )
                    }} hrs
                    @if ($attendance->total_hours > $attendance->approved_hours)
                      <div class="text-text-subtle text-[11px]">
                        ({{
                          number_format(
                            $attendance->total_hours,
                            1,
                          )
                        }} hrs logged)
                      </div>
                    @endif
                  </div>
                </x-table.cell>

                <x-table.cell>
                  <div class="flex max-w-36 flex-wrap gap-1">
                    @foreach ($attendance->attendance_statuses as $status)
                      <span
                        @class ([
                          "inline-flex rounded-full px-2 py-1 text-[11px] font-semibold",
                          "bg-success-50 text-success-700" => $status === "present",
                          "bg-danger-50 text-danger-700" => $status === "absent",
                          "bg-warning-50 text-warning-700" => in_array($status, ["late", "early out"]),
                          "bg-info-50 text-info-600" => $status === "incomplete"
                        ])
                        >{{ ucfirst($status) }}</span
                      >
                    @endforeach
                  </div>
                </x-table.cell>

                <x-table.cell class="print:hidden">
                  @php
                    $isApproved = $attendance->is_fully_approved;
                  @endphp
                  <form
                    method="POST"
                    action="{{ route("web.{$role}.attendance.toggle", $attendance) }}"
                  >
                    @csrf
                    @method ("PATCH")
                    <button
                      type="submit"
                      class="bg-primary-50 text-primary-700 hover:bg-primary-500 inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:text-white"
                      title="Toggle all 4 session slots at once"
                    >
                      {{
                        $isApproved
                          ? "All Approved"
                          : "Toggle All 4"
                      }}
                    </button>
                  </form>
                </x-table.cell>

                <x-table.actions
                  :model="$attendance"
                  :actions="['view', 'edit', 'delete']"
                  routePrefix="attendance"
                  deleteLabel="{{ $attendance->student?->full_name ?? 'Student' }}'s attendance on {{ $attendance->date?->format('M d') }}"
                />
              </x-table.row>
            @empty
              <x-table.empty-state
                message="No attendance records found."
                :colspan="count($headers)"
              />
            @endforelse
          </x-table>
        </div>
      </div>

      <div class="print:hidden">
        <x-pagination :paginator="$attendances" />
      </div>
    </div>
  @endif
@endsection

@if (isset($attendances))
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
