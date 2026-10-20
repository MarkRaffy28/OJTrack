@extends ("layouts.app")

@section ("title", "View Office")

@section ("header_title", "View Office")

@section ("header_edit_route", route("web.{$currentRole}.offices.edit", $office))
@section ("header_go_back", "")

@section ("header_description")
  View detailed information about the office or company.
@endsection

@section ("content")
  <div class="mx-auto w-full max-w-6xl space-y-6">
    {{-- OFFICE HEADER --}}
    <div class="border-border bg-surface rounded-2xl border p-6 shadow-sm">
      <div class="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
        <div
          class="bg-primary-50 text-primary-600 flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
        >
          <span class="material-symbols-outlined material-symbols-md" aria-hidden="true"
            >business</span
          >
        </div>

        <p class="text-text min-w-0 truncate text-xl font-bold">{{ $office->name }}</p>
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
            <x-fields.office field="contact_phone" :office="$office" mode="view" />
          </div>
          <div class="min-w-0">
            <x-fields.office field="contact_email" :office="$office" mode="view" />
          </div>
          <div class="min-w-0 sm:col-span-2">
            <x-fields.office field="address" :office="$office" mode="view" />
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
            <x-fields.office field="morning_in" :office="$office" mode="view" />
          </div>
          <div class="min-w-0">
            <x-fields.office field="morning_out" :office="$office" mode="view" />
          </div>
          <div class="min-w-0">
            <x-fields.office field="afternoon_in" :office="$office" mode="view" />
          </div>
          <div class="min-w-0">
            <x-fields.office field="afternoon_out" :office="$office" mode="view" />
          </div>
        </div>
      </section>
    </div>
  </div>
@endsection
