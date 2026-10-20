@php($role = auth()->user()->role->value)
@php($isAdmin = auth()->user()->isAdmin() || auth()->user()->isSuperAdmin())
@extends('layouts.app')
@section('title', 'Evaluation details')
@section('header_title', $studentOjt->student?->full_name . ' — Evaluations')
@section('header_description', 'Review the three evaluation records for this student.')
@section('header_print')@endsection
@if($isAdmin)
  @section('header_create_route', route('web.' . $role . '.evaluations.create', ['student_ojt_id' => $studentOjt->id]))
  @section('header_create_button_text', 'Create Evaluation')
@endif
@section('content')
  @php($details = $studentOjt->evaluation?->details?->keyBy(fn($d) => $d->evaluation_type . ':' . ($d->period ?? 'supervisor')) ?? collect())
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"><x-table :headers="['Evaluation', 'Evaluator', 'Status', 'Actions']">
    @foreach([['Supervisor', 'supervisor', 'supervisor'], ['Instructor midterm', 'instructor', 'midterm'], ['Instructor final', 'instructor', 'final']] as [$label, $type, $period])
      @php($detail = $details->get("$type:$period"))
      @php($canEdit = $detail && ($isAdmin || ($type === 'instructor' && $detail->status->value === 'draft')))
      <x-table.row
        :model="$studentOjt"
        routePrefix="evaluations"
        :routeParameters="['studentOjt' => $studentOjt]"
        :rowHref="$detail ? route('web.' . $role . '.evaluations.detail.show', [$studentOjt, $detail]) : null"
      >
        <x-table.cell>{{ $label }}</x-table.cell>
        <x-table.cell>{{ $detail?->evaluator?->full_name ?? ($type === 'supervisor' ? ($studentOjt->supervisor?->full_name ?? 'Unassigned') : 'Not started') }}</x-table.cell>
        <x-table.cell>@if($detail)<a class="underline underline-offset-4" href="{{ route('web.' . $role . '.evaluations.detail.show', [$studentOjt, $detail]) }}">{{ ucfirst($detail->status->value) }}</a>@else<span class="text-gray-500">Pending</span>@endif</x-table.cell>
        @if($detail)
          <x-table.actions :model="$detail" :actions="array_values(array_filter(['view', $canEdit ? 'edit' : null, $isAdmin ? 'delete' : null]))" :viewRoute="route('web.' . $role . '.evaluations.detail.show', [$studentOjt, $detail])" :editRoute="$canEdit ? route('web.' . $role . '.evaluations.detail.edit', [$studentOjt, $detail]) : null" :deleteRoute="$isAdmin ? route('web.' . $role . '.evaluations.detail.destroy', [$studentOjt, $detail]) : null" routePrefix="evaluations" deleteTitle="Delete Evaluation" deleteLabel="this evaluation" />
        @else
          <x-table.cell>@if($type === 'instructor')<a class="text-primary-700 underline underline-offset-4" href="{{ route('web.' . $role . '.evaluations.detail.create', [$studentOjt, $period]) }}">Start</a>@else<span class="text-gray-500">Waiting</span>@endif</x-table.cell>
        @endif
      </x-table.row>
    @endforeach
  </x-table></div>
@endsection
