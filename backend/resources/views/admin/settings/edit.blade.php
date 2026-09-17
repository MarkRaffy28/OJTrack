@extends ("layouts.app")

@section ("title", "Edit Settings")

@section ("header_title", "Edit Settings")

@section ("header_description",
  "Update the academic year, term, and schedule settings for the system.")

@section ("content")
  <div class="mx-auto max-w-4xl">
    {{-- Page heading --}}
    <div class="mb-6 flex items-center gap-4"></div>
    <div></div>
  </div>

  {{-- Card --}}
  <div class="border-border bg-surface overflow-hidden rounded-xl border shadow-sm">
    <x-form.form method="PUT" action="{{ route('web.admin.settings.update') }}">
      <div class="p-6">
        {{-- Section label --}}
        <div class="bg-primary-50 mb-6 flex items-center gap-2 rounded-lg px-4 py-3">
          <span class="material-symbols-outlined text-primary-700">school</span>
          <span class="text-primary-700 font-semibold">Academic Information</span>
        </div>

        <div class="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          @foreach ($settings as $setting)
            <x-fields.setting
              :field="$setting->setting_key->value"
              :value="$setting->setting_value"
            />
          @endforeach
        </div>
      </div>

      {{-- Footer --}}
      <div
        class="border-border bg-background flex items-center justify-between border-t px-6 py-4"
      >
        <button
          type="reset"
          class="border-border bg-surface text-text hover:bg-background inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium"
        >
          <span class="material-symbols-outlined text-base">restart_alt</span>
          Reset
        </button>

        <x-form.submit>
          <span class="material-symbols-outlined text-base">send</span>
          Submit
        </x-form.submit>
      </div>
    </x-form.form>
  </div>
  </div>
@endsection
