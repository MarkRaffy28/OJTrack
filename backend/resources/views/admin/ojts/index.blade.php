@extends('layouts.app')

@php($role = auth()->user()->role->value)

@section('title', 'OJT Periods')
@section('header_title', 'OJT Periods')
@section('header_description', 'Create and manage academic year and term combinations used for OJT assignments.')
@section('header_create_route', route("web.{$role}.ojts.create"))
@section('header_create_button_text', 'Create OJT Period')

@section('content')
  <div class="space-y-4">
    <x-table :headers="['Academic Year', 'Term', 'Start Date', 'End Date', 'Assignments', 'Actions']">
      @forelse ($ojts as $ojt)
        <x-table.row :model="$ojt">
          <x-table.cell>{{ $ojt->academic_year }}</x-table.cell>
          <x-table.cell>{{ $ojt->term->value }}</x-table.cell>
          <x-table.cell>{{ $ojt->start_date->format('M d, Y') }}</x-table.cell>
          <x-table.cell>{{ $ojt->end_date->format('M d, Y') }}</x-table.cell>
          <x-table.cell>{{ $ojt->student_ojts_count }}</x-table.cell>
          <x-table.actions :model="$ojt" :actions="['view', 'edit']" />
        </x-table.row>
      @empty
        <x-table.empty-state message="No OJT periods found." :colspan="6" />
      @endforelse
    </x-table>
    <x-pagination :paginator="$ojts" />
  </div>
@endsection
