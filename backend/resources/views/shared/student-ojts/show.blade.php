@php($role = auth()->user()->role->value)
@php($renderedHours = $studentOjt->rendered_hours)
@php($requiredHours = (float) $studentOjt->required_hours)
@php($remainingHours = max($requiredHours - $renderedHours, 0))
@extends('layouts.app')

@section('title', 'Student OJT Details')
@section('header_title', 'Student OJT Details')
@section('header_description', 'Placement details and attendance progress for ' . ($studentOjt->student?->full_name ?? 'the trainee') . '.')
@section('header_actions')
  <div class="flex gap-2">
    <a href="{{ route("web.{$role}.evaluations." . ($studentOjt->evaluation ? 'show' : 'create-for'), $studentOjt) }}" class="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
      {{ $studentOjt->evaluation ? 'View Evaluation' : 'Create Evaluation' }}
    </a>
    <a href="{{ route("web.{$role}.student-ojts.index") }}" class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Back</a>
  </div>
@endsection

@section('content')
  <div class="mx-auto max-w-6xl space-y-6">
    <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-xl font-bold text-gray-900">{{ $studentOjt->student?->full_name ?? 'Unknown student' }}</h2>
          <p class="mt-1 text-sm text-gray-500">{{ $studentOjt->office?->name ?? 'Unassigned office' }} · {{ $studentOjt->academic_year }} / {{ $studentOjt->term?->value }}</p>
        </div>
        <span class="w-fit rounded-full bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-700">{{ ucfirst($studentOjt->status?->value ?? 'unknown') }}</span>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      @foreach ([
        ['Required Hours', number_format($requiredHours, 2) . ' hrs', 'Assigned OJT requirement'],
        ['Rendered Hours', number_format($renderedHours, 2) . ' hrs', 'Approved attendance'],
        ['Remaining Hours', number_format($remainingHours, 2) . ' hrs', 'To complete requirement'],
        ['Progress', number_format($studentOjt->progress_percent, 1) . '%', 'Based on approved hours'],
      ] as [$label, $value, $description])
        <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p class="text-sm font-medium text-gray-500">{{ $label }}</p>
          <p class="mt-2 text-2xl font-bold text-gray-900">{{ $value }}</p>
          <p class="mt-1 text-xs text-gray-500">{{ $description }}</p>
        </div>
      @endforeach
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500">Placement Information</h3>
        <dl class="mt-4 grid gap-4 sm:grid-cols-2">
          <div><dt class="text-xs text-gray-500">Supervisor</dt><dd class="mt-1 font-medium text-gray-900">{{ $studentOjt->supervisor?->full_name ?? 'Unassigned' }}</dd></div>
          <div><dt class="text-xs text-gray-500">Office</dt><dd class="mt-1 font-medium text-gray-900">{{ $studentOjt->office?->name ?? 'Unassigned' }}</dd></div>
          <div><dt class="text-xs text-gray-500">Start Date</dt><dd class="mt-1 font-medium text-gray-900">{{ $studentOjt->start_date?->format('M d, Y') ?? 'Not set' }}</dd></div>
          <div><dt class="text-xs text-gray-500">End Date</dt><dd class="mt-1 font-medium text-gray-900">{{ $studentOjt->end_date?->format('M d, Y') ?? 'Not set' }}</dd></div>
        </dl>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div class="flex justify-between text-sm"><h3 class="font-semibold text-gray-900">Completion Progress</h3><span class="font-semibold text-primary-700">{{ number_format($studentOjt->progress_percent, 1) }}%</span></div>
        <div class="mt-4 h-3 overflow-hidden rounded-full bg-gray-200"><div class="h-full rounded-full bg-primary-600" style="width: {{ $studentOjt->progress_percent }}%"></div></div>
        <p class="mt-3 text-sm text-gray-500">{{ number_format($renderedHours, 2) }} of {{ number_format($requiredHours, 2) }} required hours approved.</p>
        <p class="mt-2 text-xs text-gray-400">{{ $studentOjt->attendances->count() }} attendance record(s) logged.</p>
      </div>
    </div>
  </div>
@endsection
