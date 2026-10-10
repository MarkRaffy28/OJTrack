@php
  $role = auth()->user()->role->value;
  $route = "web.{$role}.offices.store";
@endphp

@extends ("layouts.app")

@section ("title", "Create Office")

@section ("header_title", "Create Office")

@section ("header_description")
  Add a new office or company to the system.
@endsection

@section ("content")
  {{-- Card --}}
  <div class="border-border bg-surface overflow-hidden rounded-xl border shadow-sm">
    <x-form.form action="{{ route($route) }}">
      <div class="p-6">
        {{-- Section label --}}
        <div class="bg-primary-50 mb-6 flex items-center gap-2 rounded-lg px-4 py-3">
          <span class="material-symbols-outlined text-primary-700">business</span>
          <span class="text-primary-700 font-semibold">Office Information</span>
        </div>

        <div class="space-y-6">
          <x-fields.office field="name" />
          <x-fields.office field="address" />

          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <x-fields.office field="contact_email" />
            <x-fields.office field="contact_phone" />
          </div>

          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <x-fields.office field="morning_in" />
            <x-fields.office field="morning_out" />
          </div>

          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <x-fields.office field="afternoon_in" />
            <x-fields.office field="afternoon_out" />
          </div>
        </div>
      </div>

      {{-- Footer --}}
      <div
        class="border-border bg-background flex items-center justify-between border-t px-6 py-4"
      >
        <a
          href="{{ route("web.{$role}.offices.index") }}"
          class="border-border bg-surface text-text hover:bg-background inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium"
        >
          <span class="material-symbols-outlined text-base">close</span>
          Cancel
        </a>

        <x-form.submit>
          <span class="material-symbols-outlined text-base">save</span>
          Save Office
        </x-form.submit>
      </div>
    </x-form.form>
  </div>
  </div>
@endsection
