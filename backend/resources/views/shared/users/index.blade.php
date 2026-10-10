@php
  $role = auth()->user()->role->value;
@endphp

@extends ("layouts.app")

@section ("title", "Users")
@section ("header_title", "Users")
@section ("header_description", "Manage system users.")

@section ("header_print", "")
@section ("header_create_route", route("web.{$role}.users.create"))

@section ("header_filters")
  <x-search-filter searchPlaceholder="Search Users..." :filters="$filters" />
@endsection

@section ("content")
  <div class="space-y-4">
    {{-- Table --}}
    <x-table :headers="$headers">
      @forelse ($users as $user)
        <x-table.row :model="$user">
          <x-table.cell> {{ $user->id }} </x-table.cell>

          <x-table.cell> {{ $user->user_id }}</x-table.cell>

          <x-table.cell>
            <x-avatar :user="$user" size="sm" />
          </x-table.cell>

          <x-table.cell alignment="left">
            <div class="text-text font-medium">{{ $user->full_name }}</div>
          </x-table.cell>

          <x-table.cell> {{ $user->username ?? "-" }} </x-table.cell>

          <x-table.cell> {{ $user->email }} </x-table.cell>

          <x-table.cell>
            <span
              class="bg-primary-50 text-primary-700 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
            >
              {{ $user->role->value }}
            </span>
          </x-table.cell>

          <x-table.cell>
            <span
              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {{ $user->status->badgeClass() }}"
            >
              {{ $user->status->value }}
            </span>
          </x-table.cell>

          <x-table.actions
            :model="$user"
            :actions="['view', 'edit', 'delete']"
            deleteLabel="{{ $user->full_name }}'s account"
          />
        </x-table.row>
      @empty
        <x-table.empty-state message="No users found." :colspan="count($headers)" />
      @endforelse
    </x-table>

    {{-- Pagination --}}
    <div class="print:hidden">
      <x-pagination :paginator="$users" />
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
