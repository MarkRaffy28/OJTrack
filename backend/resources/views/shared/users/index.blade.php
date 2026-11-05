@php
  /** @var \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users */
@endphp

@extends ("layouts.app")

@section ("title", "Users")
@section ("header_title", "Users")
@section ("header_description", "Manage system users.")

@section ("header_print", "")
@section ("header_create_route", route("{$currentRole}.users.create"))

@section ("header_filters")
  <x-search-filter searchPlaceholder="Search Users..." :filters="$filters" />
@endsection

@section ("content")
  <div class="space-y-4">
    {{-- Table --}}
    <x-table :headers="$headers">
      @forelse ($users as $user)
        <x-table.row :model="$user">
          <x-table.cell class="text-text-subtle tabular-nums">
            {{ $user->id }}
          </x-table.cell>

          <x-table.cell class="text-text-muted tabular-nums">
            {{ $user->user_id }}
          </x-table.cell>

          <x-table.cell>
            <x-avatar :user="$user" size="sm" />
          </x-table.cell>

          <x-table.cell alignment="left" class="font-medium text-text">
            {{ $user->display_name }}
          </x-table.cell>

          <x-table.cell class="text-text-muted">
            {{ $user->username }}
          </x-table.cell>

          <x-table.cell class="max-w-56 truncate text-text-muted">
            {{ $user->email }}
          </x-table.cell>

          <x-table.cell
            alignment="center"
            class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {{ $user->role->class() }}"
          >
            {{ $user->role->label() }}
          </x-table.cell>

          <x-table.cell
            class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium {{ $user->status->class() }}"
          >
            <span class="size-1.5 rounded-full bg-current" aria-hidden="true"></span>
            {{ $user->status->label() }}
          </x-table.cell>

          <x-table.actions
            :model="$user"
            :actions="['view', 'edit', 'delete', 'restore']"
            deleteLabel="{{ $user->full_name }}'s account"
          />
        </x-table.row>
      @empty
        <x-table.empty-state
          message="No users found."
          :colspan="count($headers)"
        />
      @endforelse
    </x-table>

    {{-- Pagination --}}
    <x-pagination :paginator="$users" />
  </div>
@endsection
