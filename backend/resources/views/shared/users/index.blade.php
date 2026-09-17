@php
  $role = auth()->user()->role->value;
@endphp

@extends ("layouts.app")

@section ("title", "Users")

@section ("header_title", "Users")

@section ("header_description", "Manage system users.")

@section ("header_actions")
  <button
    type="button"
    onclick="window.print()"
    class="print:hidden inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text hover:bg-background"
  >
    <span class="material-symbols-outlined text-base">print</span>
    Print
  </button>

  <a
    href="{{ route('web.admin.users.create') }}"
    class="print:hidden inline-flex items-center gap-1.5 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1Z" />
    </svg>
    Create
  </a>
@endsection

@section ("content")
  <div class="space-y-4">
    {{-- Search + Filter --}}
    <form
      method="GET"
      action="{{ route("web.{$role}.users.index") }}"
      data-live-search="true"
      class="print:hidden flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-center"
    >
      <div class="relative flex-1">
        <span class="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-text-subtle">search</span>
        <input
          type="text"
          name="search"
          value="{{ request("search") }}"
          placeholder="Search by name, username, or email..."
          class="w-full rounded-md border border-border py-2 pr-3 pl-10 text-sm text-text placeholder:text-text-subtle focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
        />
      </div>

      <select
        name="role"
        class="rounded-md border border-border px-3 py-2 text-sm text-text focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
      >
        <option value="">All Roles</option>
        <option value="admin" @selected(request("role") === "admin")>Admin</option>
        <option value="instructor" @selected(request("role") === "instructor")>Instructor</option>
        <option value="supervisor" @selected(request("role") === "supervisor")>Supervisor</option>
        <option value="student" @selected(request("role") === "student")>Student</option>
      </select>

      <select
        name="status"
        class="rounded-md border border-border px-3 py-2 text-sm text-text focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
      >
        <option value="">All Statuses</option>
        <option value="active" @selected(request("status") === "active")>Active</option>
        <option value="inactive" @selected(request("status") === "inactive")>Inactive</option>
      </select>

      <div class="flex gap-2">
        <button
          type="submit"
          class="inline-flex items-center gap-1.5 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <span class="material-symbols-outlined text-base">filter_alt</span>
          Filter
        </button>
      </div>
    </form>

    {{-- Table --}}
    <x-table
      :headers="[
        'Profile Picture',
        'Name',
        'Username',
        'Email',
        'Role',
        'Status',
        'Actions',
      ]"
    >
      @forelse ($users as $user)
        <x-table.row>
          <x-table.cell>
            <x-avatar :user="$user" size="sm" />
          </x-table.cell>

          <x-table.cell>
            <div class="text-text font-medium">{{ $user->full_name }}</div>
          </x-table.cell>

          <x-table.cell> {{ $user->username ?? '-' }} </x-table.cell>

          <x-table.cell> {{ $user->email }} </x-table.cell>

          <x-table.cell>
            <span
              class="bg-primary-50 text-primary-700 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
            >
              {{ $user->role->value }}
            </span>
          </x-table.cell>

          <x-table.cell>
            @php
              $statusStyles = match (strtolower($user->status->value)) {
                "active" => "bg-success-50 text-success-700",
                "inactive", "disabled" => "bg-danger-50 text-danger-700",
                default => "bg-slate-100 text-text-muted",
              };
            @endphp
            <span
              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {{ $statusStyles }}"
            >
              {{ $user->status->value }}
            </span>
          </x-table.cell>

          <x-table.cell>
            <div class="print:hidden flex items-center gap-2">
              {{-- View --}}
              <a
                href='{{ route("web.{$role}.users.show", $user) }}'
                class="bg-success-50 text-success-700 hover:bg-success-500 inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:text-white"
              >
                View
              </a>

              {{-- Edit --}}
              <a
                href="{{ route('web.' . $role . '.users.edit', $user) }}"
                class="bg-warning-50 text-warning-700 hover:bg-warning-500 inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:text-white"
              >
                Edit
              </a>

              {{-- Delete --}}
              <form
                method="POST"
                action="{{ route('web.' . $role . '.users.destroy', $user) }}"
                class="inline-flex"
              >
                @csrf
                @method ("DELETE")

                <x-u-i.delete-dialog
                  :item="$user->full_name"
                  title="Delete User"
                  class="text-xs font-medium text-red-600 hover:text-red-700"
                />
              </form>
            </div>
          </x-table.cell>
        </x-table.row>
      @empty
        <x-table.empty-state message="No users found." :colspan="6" />
      @endforelse
    </x-table>

    {{-- Pagination --}}
    <div class="print:hidden">
      <x-pagination :paginator="$users" />
    </div>
  </div>
@endsection

@push ("scripts")
  <script>
    document.addEventListener('DOMContentLoaded', function () {
      document.querySelectorAll('form[data-live-search]').forEach(function (form) {
        const input = form.querySelector('input[name="search"]');
        const table = form.closest('.space-y-4')?.querySelector('table');

        if (!input || !table) return;

        const rows = Array.from(table.querySelectorAll('tbody tr'));

        rows.forEach(function (row) {
          row.querySelectorAll('td').forEach(function (cell) {
            if (!cell.dataset.originalHtml) {
              cell.dataset.originalHtml = cell.innerHTML;
            }
          });
        });

        function escapeHtml(value) {
          return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/'/g, '&#039;');
        }

        function highlightMatches(value, query) {
          if (!query) return escapeHtml(value);

          const escaped = escapeHtml(value);
          const pattern = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');

          return escaped.replace(pattern, '<mark>$1</mark>');
        }

        function applyFilter() {
          const query = input.value.trim().toLowerCase();

          rows.forEach(function (row) {
            const rowText = row.textContent.toLowerCase();
            const matches = !query || rowText.includes(query);
            row.style.display = matches ? '' : 'none';

            if (!query) {
              row.querySelectorAll('td').forEach(function (cell) {
                cell.innerHTML = cell.dataset.originalHtml || cell.innerHTML;
              });
              return;
            }

            row.querySelectorAll('td').forEach(function (cell) {
              if (cell.querySelector('a, button, input, select, svg, img')) {
                return;
              }

              const safeText = (cell.textContent || '').trim();
              if (!safeText) return;

              cell.innerHTML = highlightMatches(safeText, query);
            });
          });
        }

        input.addEventListener('input', applyFilter);
        applyFilter();
      });
    });
  </script>
@endpush

@push ("styles")
  <style>
    @media print {
      body * {
        visibility: hidden;
      }
      main, main * {
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