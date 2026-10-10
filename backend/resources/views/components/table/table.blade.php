<div class="border-border overflow-hidden rounded-xl border">
  <div class="overflow-x-auto">
    <table class="w-full text-left text-sm">
      <thead class="bg-primary-50 border-border border-b">
        <tr>
          @foreach ($headers as $key => $header)
            @php
              $isSortable = is_array($header) && isset($header["key"]);
              $sortKey = $isSortable ? $header["key"] : $key;
              $sortLabel = is_array($header) ? $header["label"] ?? $header : $header;
              $currentSort = request("sort") ?? "id";
              $currentDir = request("direction", "asc");
              $isCurrentSort = $currentSort === $sortKey;
              $nextDir = !$isCurrentSort ? "desc" : ($currentDir === "asc" ? "desc" : "asc");
              $sortUrl = request()->fullUrlWithQuery(["sort" => $sortKey, "direction" => $nextDir]);
              $isDefaultId = $sortKey === "id" && !request("sort");
            @endphp

            <th
              class="text-primary-700 px-4 py-3 text-center font-bold whitespace-nowrap"
            >
              @if ($isSortable)
                @if ($isDefaultId)
                  <span class="inline-flex items-center gap-1.5">
                    {{ $sortLabel }}
                    <span class="material-symbols-outlined material-symbols-xs">
                      arrow_upward
                    </span>
                  </span>
                @else
                  <a
                    href="{{ $sortUrl }}"
                    class="hover:text-primary-800 inline-flex items-center gap-1.5 transition-colors"
                  >
                    {{ $sortLabel }}
                    <span
                      class="material-symbols-outlined material-symbols-xs {{ !$isCurrentSort ? 'opacity-40' : '' }}"
                    >
                      {{
                        $isCurrentSort && $currentDir === "desc"
                          ? "arrow_downward"
                          : "arrow_upward"
                      }}
                    </span>
                  </a>
                @endif
              @else
                {{ $sortLabel }}
              @endif
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
</div>
