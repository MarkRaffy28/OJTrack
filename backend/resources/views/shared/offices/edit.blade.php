@php
  $route = "web.{$currentRole}.offices.update";
@endphp

@extends ("layouts.app")

@section ("title", "Edit Office")

@section ("header_title", "Edit Office")

@section ("header_go_back", "")

@section ("header_description")
  Update the details of the selected office or company.
@endsection

@section ("content")
  <div class="mx-auto w-full max-w-6xl">
    <x-form.form method="PUT" action="{{ route($route, $office) }}">
      <div class="space-y-6">
        {{-- OFFICE HEADER --}}
        <div class="border-border bg-surface rounded-2xl border p-6 shadow-sm">
          <div class="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div
              class="bg-primary-50 text-primary-600 flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
            >
              <span
                class="material-symbols-outlined material-symbols-md"
                aria-hidden="true"
                >business</span
              >
            </div>

            <div class="min-w-0 flex-1">
              <x-fields.office field="name" :office="$office" />
            </div>
          </div>
        </div>

        {{-- TWO-COLUMN LAYOUT --}}
        <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          {{-- CONTACT INFORMATION --}}
          <section
            class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
          >
            <div
              class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
            >
              <span
                class="material-symbols-outlined material-symbols-md text-primary-600"
                aria-hidden="true"
                >call</span
              >
              <h2 class="text-text text-sm font-semibold">Contact Information</h2>
            </div>
            <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
              <div class="min-w-0">
                <x-fields.office field="contact_phone" :office="$office" />
              </div>
              <div class="min-w-0">
                <x-fields.office field="contact_email" :office="$office" />
              </div>
              <div class="min-w-0 sm:col-span-2">
                <x-fields.office field="address" :office="$office" />
              </div>
            </div>
          </section>

          {{-- OFFICE HOURS --}}
          <section
            class="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm"
          >
            <div
              class="border-border-muted bg-background flex items-center gap-2 border-b px-5 py-3"
            >
              <span
                class="material-symbols-outlined material-symbols-md text-primary-600"
                aria-hidden="true"
                >schedule</span
              >
              <h2 class="text-text text-sm font-semibold">Office Hours</h2>
            </div>
            <div class="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2">
              <div class="min-w-0">
                <x-fields.office field="morning_in" :office="$office" />
              </div>
              <div class="min-w-0">
                <x-fields.office field="morning_out" :office="$office" />
              </div>
              <div class="min-w-0">
                <x-fields.office field="afternoon_in" :office="$office" />
              </div>
              <div class="min-w-0">
                <x-fields.office field="afternoon_out" :office="$office" />
              </div>
            </div>
          </section>
        </div>

        {{-- ACTIONS --}}
        <div
          class="border-border bg-surface flex items-center justify-end gap-3 rounded-2xl border p-4 shadow-sm"
        >
          <a
            href="{{ route("web.{$currentRole}.offices.index") }}"
            class="border-border bg-surface text-text hover:bg-background inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
          >
            Cancel
          </a>

          <x-form.submit />
        </div>
      </div>
    </x-form.form>
  </div>
@endsection
