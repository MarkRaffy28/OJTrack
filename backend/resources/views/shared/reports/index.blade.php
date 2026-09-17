@php($role = auth()->user()->role->value)
@extends('layouts.app')

@section('title', 'Reports')
@section('header_title', 'Reports')
@section('header_description', 'Manage OJT reports and supporting files.')
@section('header_actions')
  <a href="{{ route("web.{$role}.reports.create") }}" class="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Create Report</a>
@endsection

@section('content')
  <div class="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
    <div class="overflow-x-auto">
      <x-table :headers="['Student', 'Type', 'Report Date', 'Files', 'Status', 'Actions']">
        @forelse ($reports as $report)
          <x-table.row>
            <x-table.cell>
              <span class="font-medium text-text">{{ $report->student?->full_name ?? 'Unknown student' }}</span>
              @if ($report->ojt)
                <span class="block text-xs text-text-subtle">{{ $report->ojt->academic_year }} / {{ $report->ojt->term?->value }}</span>
              @endif
            </x-table.cell>
            <x-table.cell>{{ ucfirst($report->type?->value ?? 'Report') }}</x-table.cell>
            <x-table.cell>{{ $report->report_date?->format('M d, Y') ?? '—' }}</x-table.cell>
            <x-table.cell>
              <span class="inline-flex items-center gap-1 text-text-muted"><span class="material-symbols-outlined text-sm">attach_file</span>{{ count($report->document_paths ?? []) }}</span>
            </x-table.cell>
            <x-table.cell><span class="inline-flex rounded-full bg-background px-2.5 py-1 text-xs font-semibold text-text-muted">{{ ucfirst($report->status?->value ?? 'Unknown') }}</span></x-table.cell>
            <x-table.cell>
              <div class="flex items-center gap-2">
                <a href="{{ route("web.{$role}.reports.show", $report) }}" class="rounded-md bg-primary-50 px-2.5 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-600 hover:text-white">View</a>
                <a href="{{ route("web.{$role}.reports.edit", $report) }}" class="rounded-md bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-600 hover:text-white">Edit</a>
              </div>
            </x-table.cell>
          </x-table.row>
        @empty
          <x-table.empty-state message="No reports found." :colspan="6" />
        @endforelse
      </x-table>
    </div>
  </div>
  <x-pagination :paginator="$reports" />
@endsection
