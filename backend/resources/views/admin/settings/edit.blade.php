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
    <x-form.form method="PUT" enctype="multipart/form-data" action="{{ route('web.admin.settings.update') }}">
      <div class="p-6">
        {{-- Section label --}}
        <div class="bg-primary-50 mb-6 flex items-center gap-2 rounded-lg px-4 py-3">
          <span class="material-symbols-outlined text-primary-700">school</span>
          <span class="text-primary-700 font-semibold">Academic Information</span>
        </div>

        @php($academicKeys = ['academic_year', 'term', 'required_hours', 'start_date', 'end_date'])
        <div class="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          @foreach ($settings as $setting)
            @if (in_array($setting->setting_key->value, $academicKeys))
              <x-fields.setting :field="$setting->setting_key->value" :value="$setting->setting_value" />
            @endif
          @endforeach
        </div>

        <div class="bg-primary-50 mt-8 mb-6 flex items-center gap-2 rounded-lg px-4 py-3">
          <span class="material-symbols-outlined text-primary-700">event_available</span>
          <span class="text-primary-700 font-semibold">Allowed Attendance Dates</span>
        </div>
        <div id="attendance-calendar" class="rounded-lg border border-gray-200 p-3" data-selected-dates='@json(array_values($allowedAttendanceDates))' data-min-date="{{ $settings->get('start_date')?->setting_value }}" data-max-date="{{ $settings->get('end_date')?->setting_value }}">
          <input type="hidden" name="settings[allowed_attendance_dates]" id="allowed-attendance-dates" value='@json(array_values($allowedAttendanceDates))'>
          <div class="mb-4 flex items-center justify-between">
            <button type="button" id="attendance-calendar-prev" class="rounded-md border px-3 py-1 text-sm hover:bg-gray-50" aria-label="Previous month">&larr;</button>
            <h3 id="attendance-calendar-label" class="font-semibold"></h3>
            <button type="button" id="attendance-calendar-next" class="rounded-md border px-3 py-1 text-sm hover:bg-gray-50" aria-label="Next month">&rarr;</button>
          </div>
          <div class="mb-2 grid grid-cols-7 text-center text-xs font-semibold text-gray-500"><span class="text-red-600">Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span class="text-red-600">Sat</span></div>
          <div id="attendance-calendar-grid" class="grid grid-cols-7 gap-1"></div>
          <p class="mt-4 text-xs text-gray-500">Select weekdays when attendance may be logged. Weekends are disabled and shown in red.</p>
          <p id="attendance-calendar-selected" class="mt-2 text-sm text-gray-700"></p>
        </div>

        <div class="bg-primary-50 mt-8 mb-6 flex items-center gap-2 rounded-lg px-4 py-3"><span class="material-symbols-outlined text-primary-700">rule</span><span class="text-primary-700 font-semibold">Evaluation</span></div>
        <div class="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          @foreach ($settings as $setting)
            @if (in_array($setting->setting_key->value, ['evaluation_open', 'evaluation_trigger_days']))
              <x-fields.setting :field="$setting->setting_key->value" :value="$setting->setting_value" />
            @endif
          @endforeach
        </div>

        <div class="bg-primary-50 mt-8 mb-6 flex items-center gap-2 rounded-lg px-4 py-3"><span class="material-symbols-outlined text-primary-700">backup</span><span class="text-primary-700 font-semibold">Backups</span></div>
        <div class="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          @foreach ($settings as $setting)
            @if ($setting->setting_key->value === 'backup_interval')
              <x-fields.setting :field="$setting->setting_key->value" :value="$setting->setting_value" />
            @endif
          @endforeach
        </div>

        <div class="bg-primary-50 mt-8 mb-6 flex items-center gap-2 rounded-lg px-4 py-3">
          <span class="material-symbols-outlined text-primary-700">description</span>
          <span class="text-primary-700 font-semibold">Report Templates</span>
        </div>
        <p class="text-text-muted mb-4 text-sm">Upload optional .doc or .docx templates. Students will see the template for the selected report type.</p>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          @foreach (['daily' => 'Daily', 'weekly' => 'Weekly', 'monthly' => 'Monthly', 'terminal' => 'Terminal'] as $type => $label)
            @php($template = $settings->get("report_template_{$type}"))
            <div>
              <label class="block text-sm font-medium">{{ $label }} Report Template</label>
              <input type="file" name="settings[report_template_{{ $type }}]" accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
              @if ($template?->setting_value)
                <p class="mt-1 text-xs text-gray-500">Current: {{ basename($template->setting_value) }}</p>
              @endif
            </div>
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

@push ("scripts")
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const calendar = document.getElementById('attendance-calendar');
      if (!calendar) return;
      const selected = new Set(JSON.parse(calendar.dataset.selectedDates || '[]'));
      const hidden = document.getElementById('allowed-attendance-dates');
      const grid = document.getElementById('attendance-calendar-grid');
      const label = document.getElementById('attendance-calendar-label');
      const selectedLabel = document.getElementById('attendance-calendar-selected');
      const minDate = calendar.dataset.minDate ? new Date(calendar.dataset.minDate + 'T00:00:00') : null;
      const maxDate = calendar.dataset.maxDate ? new Date(calendar.dataset.maxDate + 'T00:00:00') : null;
      const today = new Date();
      let month = new Date(today.getFullYear(), today.getMonth(), 1);
      const dateKey = (date) => String(date.getFullYear()) + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
      const inBounds = (date) => (!minDate || date >= minDate) && (!maxDate || date <= maxDate);
      function render() {
        const year = month.getFullYear(), monthIndex = month.getMonth();
        label.textContent = month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
        grid.innerHTML = '';
        for (let i = 0; i < new Date(year, monthIndex, 1).getDay(); i++) grid.appendChild(document.createElement('span'));
        for (let day = 1; day <= new Date(year, monthIndex + 1, 0).getDate(); day++) {
          const date = new Date(year, monthIndex, day), key = dateKey(date);
          const weekend = date.getDay() === 0 || date.getDay() === 6;
          const button = document.createElement('button');
          button.type = 'button'; button.textContent = day; button.className = 'mx-auto h-9 w-9 rounded-full text-sm transition-colors';
          if (weekend) { button.disabled = true; button.className += ' cursor-not-allowed bg-gray-50 text-red-600'; }
          else if (!inBounds(date)) { button.disabled = true; button.className += ' cursor-not-allowed text-gray-300'; }
          else {
            button.className += selected.has(key) ? ' bg-primary-600 text-white' : ' border border-gray-200 hover:bg-primary-50';
            button.setAttribute('aria-pressed', selected.has(key));
            button.addEventListener('click', () => { selected.has(key) ? selected.delete(key) : selected.add(key); render(); });
          }
          grid.appendChild(button);
        }
        const dates = [...selected].sort();
        hidden.value = JSON.stringify(dates);
        selectedLabel.textContent = dates.length ? dates.length + ' weekday' + (dates.length === 1 ? '' : 's') + ' selected.' : 'No attendance dates selected.';
      }
      document.getElementById('attendance-calendar-prev').addEventListener('click', () => { month = new Date(month.getFullYear(), month.getMonth() - 1, 1); render(); });
      document.getElementById('attendance-calendar-next').addEventListener('click', () => { month = new Date(month.getFullYear(), month.getMonth() + 1, 1); render(); });
      render();
    });
  </script>
@endpush
