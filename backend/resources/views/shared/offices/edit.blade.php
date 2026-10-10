@php
  $role = auth()->user()->role->value;
  $route = "web.{$role}.offices.update";
@endphp

@extends ("layouts.app")

@section ("title", "Edit Office")

@section ("header_title", "Edit Office")

@section ("header_description")
  Update the details of the selected office or company.
@endsection

@section ("content")
  <div class="mx-auto w-full max-w-5xl">
    {{-- Card --}}
    <div class="border-border bg-surface overflow-hidden rounded-xl border shadow-sm">
      <x-form.form method="PUT" action="{{ route($route, $office) }}">
        <div class="p-6 sm:p-8">
          {{-- Office Information section --}}
          <div class="bg-primary-50 mb-6 flex items-center gap-2 rounded-lg px-4 py-3">
            <span class="material-symbols-outlined text-primary-700">description</span>
            <span class="text-primary-700 font-semibold">Office Information</span>
          </div>

          <div class="space-y-6">
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <x-fields.office field="name" :office="$office" />
              <x-fields.office field="address" :office="$office" />
            </div>

            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <x-fields.office field="contact_email" :office="$office" />
              <x-fields.office field="contact_phone" :office="$office" />
            </div>
          </div>

          {{-- Office Schedule section --}}
          <div
            class="bg-primary-50 mt-8 mb-6 flex items-center gap-2 rounded-lg px-4 py-3"
          >
            <span class="material-symbols-outlined text-primary-700">schedule</span>
            <span class="text-primary-700 font-semibold">Office Schedule</span>
          </div>

          <div class="space-y-6">
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <x-fields.office field="morning_in" :office="$office" />
              <x-fields.office field="morning_out" :office="$office" />
            </div>

            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <x-fields.office field="afternoon_in" :office="$office" />
              <x-fields.office field="afternoon_out" :office="$office" />
            </div>
          </div>
        </div>

        {{-- Footer --}}
        <div
          class="border-border bg-background flex items-center justify-between border-t px-6 py-4 sm:px-8"
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
            Save Changes
          </x-form.submit>
        </div>
      </x-form.form>
    </div>
  </div>
@endsection
