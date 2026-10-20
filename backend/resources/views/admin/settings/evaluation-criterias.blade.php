@extends('layouts.app')
@section('title', 'Evaluation Criteria')
@section('header_title', 'Evaluation Criteria')
@section('header_description', 'Manage criteria used by supervisor evaluations on web and mobile.')
@section('content')
  <div class="max-w-5xl">
    <form method="POST" action="{{ route('web.admin.settings.evaluation-criterias.update') }}" class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm" id="criteria-form">
      @csrf @method('PUT')
      <div class="mb-5 flex items-center justify-between gap-4">
        <div><h2 class="text-lg font-semibold text-gray-900">Assessment Criteria</h2><p class="text-sm text-gray-500">Distribute exactly 100 points among the criteria.</p></div>
        <button type="button" id="add-criterion" class="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">+ Add Criterion</button>
      </div>
      <div id="criteria-list" class="space-y-4">
        @foreach (old('criteria', $criteria) as $index => $criterion)
          <div class="criterion-row rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div class="mb-3 flex items-center justify-between"><span class="criterion-number text-sm font-semibold text-gray-700">Criterion {{ $loop->iteration }}</span><button type="button" class="remove-criterion text-sm font-medium text-red-600 hover:text-red-800">Remove</button></div>
            <div class="grid gap-4 md:grid-cols-12">
              <input type="hidden" name="criteria[{{ $index }}][key]" value="{{ $criterion['key'] ?? '' }}">
              <div class="md:col-span-4"><label class="block text-xs font-medium text-gray-600">Label</label><input name="criteria[{{ $index }}][label]" value="{{ $criterion['label'] ?? '' }}" required class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"></div>
              <div class="md:col-span-6"><label class="block text-xs font-medium text-gray-600">Description</label><input name="criteria[{{ $index }}][description]" value="{{ $criterion['description'] ?? '' }}" required class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"></div>
              <div class="md:col-span-2"><label class="block text-xs font-medium text-gray-600">Points</label><input name="criteria[{{ $index }}][points]" type="number" min="1" value="{{ $criterion['points'] ?? 1 }}" required class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"></div>
            </div>
          </div>
        @endforeach
      </div>
      <div class="mt-5 flex items-center justify-between border-t border-gray-200 pt-4"><p class="text-sm font-semibold text-gray-700">Total points: <span id="points-total">0</span> / 100</p><button class="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Save Criteria</button></div>
      @error('criteria')<p class="mt-2 text-sm text-red-600">{{ $message }}</p>@enderror
    </form>
  </div>
  <script>
    (() => {
      const list = document.getElementById('criteria-list');
      const total = document.getElementById('points-total');
      const deriveKey = label => label.trim().replace(/[^A-Za-z0-9]+(.)?/g, (_, character) => character ? character.toUpperCase() : '').replace(/^[^A-Za-z]+/, '');
      const renumber = () => {
        [...list.children].forEach((row, index) => {
          row.querySelector('.criterion-number').textContent = `Criterion ${index + 1}`;
          const label = row.querySelector('input[name$="[label]"]');
          const key = row.querySelector('input[name$="[key]"]');
          if (label && key) key.value = deriveKey(label.value);
          row.querySelectorAll('input').forEach(input => input.name = input.name.replace(/criteria\[\d+\]/, `criteria[${index}]`));
        });
        total.textContent = [...list.querySelectorAll('input[name$="[points]"]')].reduce((sum, input) => sum + (Number(input.value) || 0), 0);
      };
      document.getElementById('add-criterion').addEventListener('click', () => {
        const index = list.children.length, row = document.createElement('div');
        row.className = 'criterion-row rounded-lg border border-gray-200 bg-gray-50 p-4';
        row.innerHTML = `<input type="hidden" name="criteria[${index}][key]"><div class="mb-3 flex items-center justify-between"><span class="criterion-number text-sm font-semibold text-gray-700"></span><button type="button" class="remove-criterion text-sm font-medium text-red-600 hover:text-red-800">Remove</button></div><div class="grid gap-4 md:grid-cols-12"><div class="md:col-span-4"><label class="block text-xs font-medium text-gray-600">Label</label><input name="criteria[${index}][label]" required class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"></div><div class="md:col-span-6"><label class="block text-xs font-medium text-gray-600">Description</label><input name="criteria[${index}][description]" required class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"></div><div class="md:col-span-2"><label class="block text-xs font-medium text-gray-600">Points</label><input name="criteria[${index}][points]" type="number" min="1" value="1" required class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"></div></div>`;
        list.appendChild(row); renumber();
      });
      list.addEventListener('click', event => { if (event.target.classList.contains('remove-criterion')) { event.target.closest('.criterion-row').remove(); renumber(); } });
      list.addEventListener('input', event => { if (event.target.name.endsWith('[points]') || event.target.name.endsWith('[label]')) renumber(); });
      renumber();
    })();
  </script>
@endsection
