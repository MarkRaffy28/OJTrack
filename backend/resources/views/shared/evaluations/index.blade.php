@php ($role = auth()->user()->role->value)
@php ($isAdmin = auth()->user()->isAdmin() || auth()->user()->isSuperAdmin())

@extends ("layouts.app")
@section ("title",
  isset($sections)
    ? "Evaluation Sections"
    : ($currentProgram && $currentSection
        ? $currentProgram . " - " . $currentSection
        : "All Students") . " Evaluations")

@section ("header_title",
  isset($sections)
    ? "Evaluations"
    : ($currentProgram && $currentSection
      ? $currentProgram . " - " . $currentSection
      : "All Students"))

@section ("header_description",
  isset($sections)
    ? "Select a cohort section to view student evaluations."
    : "Review supervisor and instructor evaluations for each student.")

@section ("header_show_cohort_selector")

@if (!isset($sections))
  @section ("header_print")
  @endsection
  @section ("header_create_route",
    route(
      "web." . $role . ".evaluations.create",
      array_filter(["program" => $currentProgram, "section" => $currentSection])
    ))
  @section ("header_create_button_text", "Create Evaluation")
  @section ("header_filters")
    <x-search-filter :filters="$filters" :showSearch="false" />
  @endsection
@endif

@section ("content")
  @if (isset($sections))
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      @if ($totalStudentsCount > 0)
        <x-selectable-card
          icon="group"
          title="All Students"
          subtitle="View students across all sections"
          :id="1"
          param="all_evaluations"
          :count="$totalStudentsCount"
          countLabel="student"
        />
      @endif
      @forelse ($sections as $item)
        <x-selectable-card
          icon="group"
          :title="$item['label']"
          subtitle="View evaluations for this section"
          :id="$item['section']"
          param="section"
          :queryParams="['program' => $item['program']]"
          :count="$item['students_count']"
          countLabel="student"
        />
      @empty
        <x-empty-state
          icon="folder_open"
          title="No sections found"
          description="There are no student sections available for this cohort."
        />
      @endforelse
    </div>
  @else
    @php ($columnCount = count($headers))

    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <x-table :headers="$headers">
        @forelse ($evaluations as $studentOjt)
          @php ($details = $studentOjt->evaluation?->details?->keyBy( fn($d) => $d->evaluation_type . ":" . ($d->period ?? "supervisor") ) ?? collect())
          <x-table.row
            :model="$studentOjt"
            routePrefix="evaluations"
            :routeParameters="['studentOjt' => $studentOjt]"
          >
            <x-table.cell>{{ $studentOjt->id }}</x-table.cell>

            <x-table.cell :model="$studentOjt->student">
              {{
                $studentOjt->student?->full_name ??
                  "Unknown student"
              }}
            </x-table.cell>
            <x-table.cell :model="$studentOjt->office">
              {{
                $studentOjt->office?->name ??
                  "Unassigned"
              }}
            </x-table.cell>

            @if ($isAdmin)
              <x-table.cell :model="$studentOjt->instructor">{{
                $studentOjt->instructor?->full_name ??
                  "Unassigned"
              }}</x-table.cell>
            @endif
            @php ($supervisorDetail = $details->get("supervisor:supervisor"))
            <x-table.cell>
              @if ($supervisorDetail)
                <a
                  class="underline underline-offset-4 {{ in_array($supervisorDetail->status->value, ['submitted', 'finalized'], true) ? 'text-green-700' : 'text-amber-700' }}"
                  href="{{ route('web.' . $role . '.evaluations.detail.show', [$studentOjt, $supervisorDetail]) }}"
                  >{{
                    ucfirst(
                      $supervisorDetail->status->value,
                    )
                  }}</a
                >
              @else
                <a
                  class="text-gray-500 underline underline-offset-4"
                  href="{{ route('web.' . $role . '.evaluations.show', $studentOjt) }}"
                  >Pending</a
                >
              @endif
            </x-table.cell>
            @foreach (["midterm", "final"] as $period)
              @php ($detail = $details->get("instructor:" . $period))
              <x-table.cell>
                @if ($detail)
                  <a
                    class="underline underline-offset-4 {{ in_array($detail->status->value, ['submitted', 'finalized'], true) ? 'text-green-700' : 'text-amber-700' }}"
                    href="{{ route('web.' . $role . '.evaluations.detail.show', [$studentOjt, $detail]) }}"
                    >{{
                      ucfirst(
                        $detail->status->value,
                      )
                    }}</a
                  >
                @else
                  <a
                    class="text-gray-500 underline underline-offset-4"
                    href="{{ route('web.' . $role . '.evaluations.detail.create', [$studentOjt, $period]) }}"
                    >Pending</a
                  >
                @endif
              </x-table.cell>
            @endforeach
            <x-table.actions
              :model="$studentOjt"
              :actions="['view']"
              routePrefix="evaluations"
            />
          </x-table.row>
        @empty
          <x-table.empty-state
            message="No students found for this section."
            :colspan="$columnCount"
          />
        @endforelse
      </x-table>
    </div>
    <div class="mt-4"><x-pagination :paginator="$evaluations" /></div>
  @endif
@endsection
