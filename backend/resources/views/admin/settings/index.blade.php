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
  <a href="{{ route('web.admin.settings.evaluation-criterias.edit') }}" class="ml-2 bg-primary-600 hover:bg-primary-700 inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors">
    <span class="material-symbols-outlined text-base">rule</span>
    Evaluation Criteria
  </a>
  <a href="{{ route('web.admin.settings.backups.index') }}" class="ml-2 bg-primary-600 hover:bg-primary-700 inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors">
    <span class="material-symbols-outlined text-base">backup</span>
    Backups
  </a>
@endsection

@push ("scripts")
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const calendar = document.getElementById('attendance-calendar');
      if (!calendar) return;

      const selected = new Set(JSON.parse(calendar.dataset.selectedDates || '[]'));
      const grid = document.getElementById('attendance-calendar-grid');
      const label = document.getElementById('attendance-calendar-label');
      const selectedLabel = document.getElementById('attendance-calendar-selected');
      const minDate = calendar.dataset.minDate ? new Date(calendar.dataset.minDate + 'T00:00:00') : null;
      const maxDate = calendar.dataset.maxDate ? new Date(calendar.dataset.maxDate + 'T00:00:00') : null;
      const today = new Date();
      let month = minDate ? new Date(minDate.getFullYear(), minDate.getMonth(), 1) : new Date(today.getFullYear(), today.getMonth(), 1);
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
          button.type = 'button';
          button.disabled = true;
          button.textContent = day;
          button.className = 'mx-auto h-9 w-9 rounded-full text-sm';
          if (weekend) button.className += ' bg-gray-50 text-red-600';
          else if (!inBounds(date)) button.className += ' text-gray-300';
          else if (selected.has(key)) button.className += ' bg-primary-600 text-white';
          else button.className += ' border border-gray-200 text-gray-700';
          grid.appendChild(button);
        }
        selectedLabel.textContent = selected.size ? selected.size + ' weekday' + (selected.size === 1 ? '' : 's') + ' enabled.' : 'No attendance dates selected.';
      }

      document.getElementById('attendance-calendar-prev').addEventListener('click', () => { month = new Date(month.getFullYear(), month.getMonth() - 1, 1); render(); });
      document.getElementById('attendance-calendar-next').addEventListener('click', () => { month = new Date(month.getFullYear(), month.getMonth() + 1, 1); render(); });
      render();
    });
  </script>
@endpush

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

        @php($academicKeys = ['academic_year', 'term', 'required_hours', 'start_date', 'end_date'])
        <div class="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          @foreach ($settings as $setting)
            @if (in_array($setting->setting_key->value, $academicKeys))
              <x-fields.setting :field="$setting->setting_key" :value="$setting->setting_value" mode="view" />
            @endif
          @endforeach
        </div>
        <div class="bg-background mt-8 mb-6 flex items-center gap-3 rounded-lg px-4 py-3"><span class="material-symbols-outlined text-text">event_available</span><div><div class="text-text font-semibold">Allowed Attendance Dates</div><div class="text-text-muted text-xs">Weekdays enabled for mobile attendance API logging.</div></div></div>
        <div id="attendance-calendar" class="rounded-lg border border-gray-200 p-3" data-selected-dates='@json(array_values($allowedAttendanceDates))' data-min-date="{{ $settings->get('start_date')?->setting_value }}" data-max-date="{{ $settings->get('end_date')?->setting_value }}">
          <div class="mb-4 flex items-center justify-between">
            <button type="button" id="attendance-calendar-prev" class="rounded-md border px-3 py-1 text-sm hover:bg-gray-50" aria-label="Previous month">&larr;</button>
            <h3 id="attendance-calendar-label" class="font-semibold"></h3>
            <button type="button" id="attendance-calendar-next" class="rounded-md border px-3 py-1 text-sm hover:bg-gray-50" aria-label="Next month">&rarr;</button>
          </div>
          <div class="mb-2 grid grid-cols-7 text-center text-xs font-semibold text-gray-500"><span class="text-red-600">Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span class="text-red-600">Sat</span></div>
          <div id="attendance-calendar-grid" class="grid grid-cols-7 gap-1"></div>
          <p id="attendance-calendar-selected" class="mt-4 text-sm text-gray-700"></p>
        </div>
        <div class="bg-background mt-8 mb-6 flex items-center gap-3 rounded-lg px-4 py-3"><span class="material-symbols-outlined text-text">rule</span><div><div class="text-text font-semibold">Evaluation</div><div class="text-text-muted text-xs">Evaluation availability and notification timing.</div></div></div>
        <div class="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          @foreach ($settings as $setting)
            @if (in_array($setting->setting_key->value, ['evaluation_open', 'evaluation_trigger_days']))
              <x-fields.setting :field="$setting->setting_key" :value="$setting->setting_value" mode="view" />
            @endif
          @endforeach
        </div>
        <div class="bg-background mt-8 mb-6 flex items-center gap-3 rounded-lg px-4 py-3"><span class="material-symbols-outlined text-text">backup</span><div><div class="text-text font-semibold">Backups</div><div class="text-text-muted text-xs">Automatic backup schedule.</div></div></div>
        <div class="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          @foreach ($settings as $setting)
            @if ($setting->setting_key->value === 'backup_interval')
              <x-fields.setting :field="$setting->setting_key" :value="$setting->setting_value" mode="view" />
            @endif
          @endforeach
        </div>
        <div class="bg-background mt-8 mb-6 flex items-center gap-3 rounded-lg px-4 py-3">
          <span class="material-symbols-outlined text-text">description</span>
          <div><div class="text-text font-semibold">Report Templates</div><div class="text-text-muted text-xs">Configured document templates by report type.</div></div>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          @foreach (['daily' => 'Daily', 'weekly' => 'Weekly', 'monthly' => 'Monthly', 'terminal' => 'Terminal'] as $type => $label)
            @php($template = $settings->get("report_template_{$type}"))
            <div class="rounded-md border border-border p-3 text-sm"><span class="font-medium">{{ $label }}</span>: {{ $template?->setting_value ? basename($template->setting_value) : 'Not configured' }}</div>
          @endforeach
        </div>
      </div>
    </div>
  </div>
@endsection
