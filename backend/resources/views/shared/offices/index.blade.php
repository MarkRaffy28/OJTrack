@php
  $role = auth()->user()->role->value;
@endphp

@extends ("layouts.app")

@section ("title", "Offices")

@section ("header_title", "Offices")

@section ("header_description", "Manage offices.")

@section ("header_actions")
  <button
    type="button"
    onclick="window.print()"
    class="border-border bg-surface text-text hover:bg-background inline-flex items-center gap-1.5 rounded-md border px-4 py-2 text-sm font-medium print:hidden"
  >
    <span class="material-symbols-outlined text-base">print</span>
    Print
  </button>

  <a
    href="{{ route('web.admin.offices.create') }}"
    class="bg-primary-600 hover:bg-primary-700 inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors print:hidden"
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
      action="{{ route("web.{$role}.offices.index") }}"
      data-live-search="true"
      class="border-border bg-surface flex flex-col gap-3 rounded-lg border p-4 shadow-sm sm:flex-row sm:items-center print:hidden"
    >
      <div class="relative flex-1">
        <span
          class="material-symbols-outlined text-text-subtle absolute top-1/2 left-3 -translate-y-1/2"
          >search</span
        >
        <input
          type="text"
          name="search"
          value="{{ request("search") }}"
          placeholder="Search by office name or address..."
          class="border-border text-text placeholder:text-text-subtle focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border py-2 pr-3 pl-10 text-sm focus:ring-1 focus:outline-none"
        />
      </div>

      <select
        name="status"
        class="border-border text-text focus:border-primary-500 focus:ring-primary-500 rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
      >
        <option value="">All Statuses</option>
        <option value="active" @selected (request("status") === "active")>Active</option>
        <option value="inactive" @selected (request("status") === "inactive")>
          Inactive
        </option>
      </select>

      <div class="flex gap-2">
        <button
          type="submit"
          class="bg-primary-600 hover:bg-primary-700 inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium text-white"
        >
          <span class="material-symbols-outlined text-base">filter_alt</span>
          Filter
        </button>
      </div>
    </form>

    {{-- Table --}}
    <x-table
      :headers="[
        'Name',
        'Address',
        'Contact Email',
        'Contact Phone',
        'Morning Schedule',
        'Afternoon Schedule',
        'Actions',
      ]"
    >
      @forelse ($offices as $office)
        <x-table.row>
          <x-table.cell>
            <div class="text-text font-medium">{{ $office->name }}</div>
          </x-table.cell>

          <x-table.cell>
            <span class="text-text-muted">{{ $office->address }}</span>
          </x-table.cell>

          <x-table.cell>
            <span class="text-text-muted">{{ $office->contact_email }}</span>
          </x-table.cell>

          <x-table.cell>
            <span class="text-text-muted">{{ $office->contact_phone }}</span>
          </x-table.cell>

          <x-table.cell>
            <span class="text-text-muted">
              {{
                \Carbon\Carbon::parse($office->morning_in)->format(
                  "h:i A",
                )
              }} &ndash; {{
                \Carbon\Carbon::parse($office->morning_out)->format(
                  "h:i A",
                )
              }}
            </span>
          </x-table.cell>

          <x-table.cell>
            <span class="text-text-muted">
              {{
                \Carbon\Carbon::parse($office->afternoon_in)->format(
                  "h:i A",
                )
              }} &ndash; {{
                \Carbon\Carbon::parse($office->afternoon_out)->format(
                  "h:i A",
                )
              }}
            </span>
          </x-table.cell>

          <x-table.cell>
            <div class="flex items-center gap-2 print:hidden">
              {{-- View --}}

              <a
                href="{{ route("web.{$role}.offices.show", $office) }}"
                class="bg-success-50 text-success-700 hover:bg-success-500 inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:text-white"
              >
                View
              </a>

              {{-- Edit --}}

              <a
                href="{{ route("web.{$role}.offices.edit", $office) }}"
                class="bg-warning-50 text-warning-700 hover:bg-warning-500 inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:text-white"
              >
                Edit
              </a>

              {{-- Delete --}}
              <form
                method="POST"
                action="{{ route("web.{$role}.offices.destroy", $office) }}"
                class="inline-flex"
              >
                @csrf
                @method ("DELETE")

                <x-u-i.delete-dialog
                  :item="$office->name"
                  title="Delete Office"
                  class="bg-danger-50 text-danger-700 hover:bg-danger-500 inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:text-white"
                />
              </form>
            </div>
          </x-table.cell>
        </x-table.row>
      @empty
        <x-table.empty-state message="No offices found." :colspan="7" />
      @endforelse
    </x-table>

    {{-- Pagination --}}
    <div class="print:hidden">
      <x-pagination :paginator="$offices" />
    </div>
  </div>
@endsection

@push ("scripts")
  <script>
    document.addEventListener("DOMContentLoaded", function () {
      document.querySelectorAll("form[data-live-search]").forEach(function (form) {
        const input = form.querySelector('input[name="search"]');
        const table = form.closest(".space-y-4")?.querySelector("table");

        if (!input || !table) return;

        const rows = Array.from(table.querySelectorAll("tbody tr"));

        rows.forEach(function (row) {
          row.querySelectorAll("td").forEach(function (cell) {
            if (!cell.dataset.originalHtml) {
              cell.dataset.originalHtml = cell.innerHTML;
            }
          });
        });

        function escapeHtml(value) {
          return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
        }

        function highlightMatches(value, query) {
          if (!query) return escapeHtml(value);

          const escaped = escapeHtml(value);
          const pattern = new RegExp(
            "(" + query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")",
            "ig",
          );

          return escaped.replace(pattern, "<mark>$1</mark>");
        }

        function applyFilter() {
          const query = input.value.trim().toLowerCase();

          rows.forEach(function (row) {
            const rowText = row.textContent.toLowerCase();
            const matches = !query || rowText.includes(query);
            row.style.display = matches ? "" : "none";

            if (!query) {
              row.querySelectorAll("td").forEach(function (cell) {
                cell.innerHTML = cell.dataset.originalHtml || cell.innerHTML;
              });
              return;
            }

            row.querySelectorAll("td").forEach(function (cell) {
              if (cell.querySelector("a, button, input, select, svg, img")) {
                return;
              }

              const safeText = (cell.textContent || "").trim();
              if (!safeText) return;

              cell.innerHTML = highlightMatches(safeText, query);
            });
          });
        }

        input.addEventListener("input", applyFilter);
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
