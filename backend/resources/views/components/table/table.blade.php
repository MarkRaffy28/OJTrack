<div class="border-border overflow-hidden rounded-xl border">
  <div class="overflow-x-auto">
    <table class="w-full text-left text-sm">
      <thead class="bg-primary-50 border-border border-b">
        <tr>
          @foreach ($headers as $header)
            <th class="text-primary-700 px-4 py-3 font-bold whitespace-nowrap">
              {{ $header }}
            </th>
          @endforeach
        </tr>
      </thead>

      <tbody
        class="divide-border bg-surface [&_tr:nth-child(odd)]:bg-background [&_tr:hover]:bg-primary-50 [&_tr:hover]:transition-colors divide-y"
      >
        {{ $slot }}
      </tbody>
    </table>
  </div>

  @isset ($pagination)
    <div class="border-border bg-background text-text-muted border-t px-4 py-3 text-sm">
      {{ $pagination }}
    </div>
  @endisset
</div>
