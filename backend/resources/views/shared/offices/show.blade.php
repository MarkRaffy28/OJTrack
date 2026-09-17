@php
  $role = auth()->user()->role->value;
@endphp

@extends ("layouts.app")

@section ("title", "View Office")

@section ("header_title", "View Office")

@section ("header_description")
  View detailed information about the office or company.
@endsection

@section ("content")
  <div class="mx-auto w-full max-w-5xl">
    {{-- Card --}}
    <div class="border-border bg-surface overflow-hidden rounded-xl border shadow-sm">
      {{-- Banner --}}
      <div
        class="from-primary-50 to-primary-100 relative overflow-hidden bg-gradient-to-r px-6 py-6 sm:px-8"
      >
        <div class="flex flex-col gap-4 pr-20 sm:flex-row sm:items-center sm:gap-5">
          <div
            class="bg-primary-600 flex h-16 w-16 shrink-0 items-center justify-center rounded-full shadow-sm"
          >
            <span class="material-symbols-outlined text-3xl text-white">business</span>
          </div>
          <div>
            <h2 class="text-text text-xl font-bold">{{ $office->name }}</h2>
          </div>
        </div>

        <a
          href="{{ route("web.{$role}.offices.edit", $office) }}"
          class="bg-primary-600 hover:bg-primary-700 absolute top-6 right-6 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm sm:right-8"
        >
          <span class="material-symbols-outlined text-base">edit</span>
          <span class="hidden sm:inline">Edit</span>
        </a>
      </div>

      <div class="p-6 sm:p-8">
        {{-- Section label --}}
        <div class="bg-primary-50 mb-6 flex items-center gap-2 rounded-lg px-4 py-3">
          <span class="material-symbols-outlined text-primary-700">business</span>
          <span class="text-primary-700 font-semibold">Office Information</span>
        </div>

        <div class="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <x-fields.office field="name" :office="$office" mode="view" />
          <x-fields.office field="contact_phone" :office="$office" mode="view" />

          <x-fields.office field="address" :office="$office" mode="view" />
          <x-fields.office field="morning_out" :office="$office" mode="view" />

          <x-fields.office field="contact_email" :office="$office" mode="view" />
          <x-fields.office field="afternoon_out" :office="$office" mode="view" />

          <x-fields.office field="morning_in" :office="$office" mode="view" />
          <x-fields.office field="afternoon_in" :office="$office" mode="view" />
        </div>
      </div>

      {{-- Footer --}}
      <div class="border-border bg-background border-t px-6 py-4">
        <a
          href="{{ route("web.{$role}.offices.index") }}"
          class="border-border bg-surface text-primary-700 hover:bg-primary-50 inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium"
        >
          <span class="material-symbols-outlined text-base">arrow_back</span>
          Back to List
        </a>
      </div>
    </div>
  </div>
@endsection
