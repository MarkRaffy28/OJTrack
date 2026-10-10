@php
  /** @var \Illuminate\Database\Eloquent\Collection<int, \App\Models\Office> $offices */
@endphp

@extends ("layouts.app")

@section ("title", "Offices")
@section ("header_title", "Offices")
@section ("header_description", "Manage offices.")

@section ("header_print", "")
@section ("header_create_route", route("web.{$currentRole}.offices.create"))

@section ("header_filters")
  <x-search-filter searchPlaceholder="Search Offices..." :filters="$filters" />
@endsection

@section ("content")
  <div class="space-y-4">
    {{-- Table --}}
    <x-table :headers="$headers">
      @forelse ($offices as $office)
        <x-table.row :model="$office">
          <x-table.cell> {{ $office->id }} </x-table.cell>

          <x-table.cell> {{ $office->name }} </x-table.cell>

          <x-table.cell> {{ $office->address }} </x-table.cell>

          <x-table.cell>
            {{
              $office->contact_email ??
                "-"
            }}
          </x-table.cell>

          <x-table.cell>
            {{
              $office->contact_phone ??
                "-"
            }}
          </x-table.cell>

          <x-table.cell> {{ $office->morning_shift }}</x-table.cell>

          <x-table.cell> {{ $office->afternoon_shift }} </x-table.cell>

          <x-table.actions
            :model="$office"
            :actions="['view', 'edit', 'delete']"
            deleteLabel="{{ $office->name }}"
          />
        </x-table.row>
      @empty
        <x-table.empty-state message="No offices found." :colspan="count($headers)" />
      @endforelse
    </x-table>

    {{-- Pagination --}}
    <div class="print:hidden">
      <x-pagination :paginator="$offices" />
    </div>
  </div>
@endsection

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
