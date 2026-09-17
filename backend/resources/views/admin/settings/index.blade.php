@extends ("layouts.app")

@section ("title", "Settings")

@section ("header_title", "Settings")

@section ("header_description", "Manage system settings.")

@section ("header_actions")
  <a
    href="{{ route("web.admin.settings.edit") }}"
    class="bg-primary-600 hover:bg-primary-700 inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors"
  >
    <span class="material-symbols-outlined text-base">edit</span>
    Edit
  </a>
@endsection

@section ("content")
  <div class="mx-auto w-full max-w-5xl">
    {{-- Card --}}
    <div class="border-border bg-surface overflow-hidden rounded-xl border shadow-sm">
      <div class="p-6 sm:p-8">
        {{-- Section label --}}
        <div class="bg-background mb-6 flex items-center gap-3 rounded-lg px-4 py-3">
          <div
            class="bg-surface ring-border flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1"
          >
            <span class="material-symbols-outlined text-text">calendar_month</span>
          </div>
          <div>
            <div class="text-text font-semibold">Academic Information</div>
            <div class="text-text-muted text-xs">
              Set the current academic year and term details.
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          @foreach ($settings as $setting)
            <x-fields.setting
              :field="$setting->setting_key"
              :value="$setting->setting_value"
              mode="view"
            />
          @endforeach
        </div>
      </div>
    </div>
  </div>
@endsection
