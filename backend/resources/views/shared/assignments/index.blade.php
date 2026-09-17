@php
  $role = auth()->user()->role->value;
@endphp

@extends ("layouts.app")

@section ("title", "Assignments")

@section ("header_title", "Assignments")

@section ("header_description", "Manage student OJT assignments.")

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
    href="{{ route("web.{$role}.assignments.create") }}"
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
      action="{{ route("web.{$role}.assignments.index") }}"
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
          placeholder="Search by student name..."
          class="border-border text-text placeholder:text-text-subtle focus:border-primary-500 focus:ring-primary-500 w-full rounded-md border py-2 pr-3 pl-10 text-sm focus:ring-1 focus:outline-none"
        />
      </div>

      <select
        name="status"
        class="border-border text-text focus:border-primary-500 focus:ring-primary-500 rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
      >
        <option value="">All Statuses</option>
        @foreach (\App\Enums\OjtStatus::cases() as $status)
          <option
            value="{{ $status->value }}"
            @selected (request("status") === $status->value)
          >
            {{ ucfirst($status->value) }}
          </option>
        @endforeach
      </select>

      <select
        name="term"
        class="border-border text-text focus:border-primary-500 focus:ring-primary-500 rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
      >
        <option value="">All Terms</option>
        @foreach (\App\Enums\OjtTerm::cases() as $term)
          <option value="{{ $term->value }}" @selected (request("term") === $term->value)>
            {{ ucfirst($term->value) }}
          </option>
        @endforeach
      </select>

      <input
        type="text"
        name="academic_year"
        value="{{ request("academic_year") }}"
        placeholder="AY e.g. 2025-2026"
        class="border-border text-text placeholder:text-text-subtle focus:border-primary-500 focus:ring-primary-500 w-40 rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
      />

      <div class="flex gap-2">
        <button
          type="submit"
          class="bg-primary-600 hover:bg-primary-700 inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium text-white"
        >
          <span class="material-symbols-outlined text-base">filter_alt</span>
          Filter
        </button>

        @if (request()->hasAny(["search", "status", "term", "academic_year"]))
          <a
            href="{{ route("web.{$role}.assignments.index") }}"
            class="text-text-muted hover:text-text inline-flex items-center px-2 text-sm font-medium"
          >
            Clear
          </a>
        @endif
      </div>
    </form>

    {{-- Table --}}
    <x-table
      :headers="[
        'Student',
        'Supervisor',
        'Office',
        'Academic Year',
        'Term',
        'Required Hours',
        'Status',
        'Start Date',
        'End Date',
        'Actions',
      ]"
    >
      @forelse ($studentOjts as $studentOjt)
        <x-table.row>
          <x-table.cell>
            <div class="text-text font-medium">
              {{
                $studentOjt->student
                  ->full_name
              }}
            </div>
          </x-table.cell>

          <x-table.cell>
            <span class="text-text-muted">
              {{
                $studentOjt->supervisor?->full_name ??
                  "Unassigned"
              }}
            </span>
          </x-table.cell>

          <x-table.cell>
            <span class="text-text-muted">{{
              $studentOjt->office
                ->name
            }}</span>
          </x-table.cell>

          <x-table.cell>
            <span class="text-text-muted">{{ $studentOjt->academic_year }}</span>
          </x-table.cell>

          <x-table.cell>
            <span class="text-text-muted">{{ $studentOjt->term->value }}</span>
          </x-table.cell>

          <x-table.cell>
            <span class="text-text-muted">{{ $studentOjt->required_hours }}</span>
          </x-table.cell>

          <x-table.cell>
            <span class="text-text-muted">{{
              $studentOjt->status
                ->value
            }}</span>
          </x-table.cell>

          <x-table.cell>
            <span class="text-text-muted">
              {{
                $studentOjt->start_date->format(
                  "Y-m-d",
                )
              }}
            </span>
          </x-table.cell>

          <x-table.cell>
            <span class="text-text-muted">
              {{
                $studentOjt->end_date->format(
                  "Y-m-d",
                )
              }}
            </span>
          </x-table.cell>

          <x-table.cell>
            <div class="flex items-center gap-2 print:hidden">
              {{-- View --}}
              <a
                href="{{ route("web.{$role}.assignments.show", $studentOjt) }}"
                class="bg-success-50 text-success-700 hover:bg-success-500 inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:text-white"
              >
                View
              </a>

              {{-- Edit --}}
              <a
                href="{{ route("web.{$role}.assignments.edit", $studentOjt) }}"
                class="bg-warning-50 text-warning-700 hover:bg-warning-500 inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:text-white"
              >
                Edit
              </a>

              {{-- Delete --}}
              <form
                method="POST"
                action="{{ route("web.{$role}.assignments.destroy", $studentOjt) }}"
                class="inline-flex"
              >
                @csrf
                @method ("DELETE")

                <x-u-i.delete-dialog
                  :item="$studentOjt->student->full_name"
                  title="Delete Assignment"
                  class="bg-danger-50 text-danger-700 hover:bg-danger-500 inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:text-white"
                />
              </form>
            </div>
          </x-table.cell>
        </x-table.row>
      @empty
        <x-table.empty-state message="No assignments found." :colspan="10" />
      @endforelse
    </x-table>

    {{-- Pagination --}}
    <div class="print:hidden">
      <x-pagination :paginator="$studentOjts" />
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
