@php
  $criteria = $criteria ?? \App\Support\EvaluationCriteria::get();
@endphp

@extends ("layouts.pdf")

@section ("title", "Evaluations List")
@section ("header_title", "Supervisor Evaluations")

@section ("content")
  <table style="width: 100%; table-layout: fixed; word-wrap: break-word">
    <thead>
      <tr>
        <th style="width: 5%">ID</th>
        <th style="width: 14%">Student</th>
        <th style="width: 12%">Office</th>
        <th style="width: 11%">Supervisor</th>
        @foreach ($criteria as $criterion)
          <th
            style="
              width: 7%;
              font-size: 8px;
              line-height: 1.1;
              text-align: center;
              padding: 2px;
            "
          >
            {{ $criterion["label"] }}<br />({{ $criterion["points"] }}pts)
          </th>
        @endforeach
        <th style="width: 9%; text-align: center">Total</th>
        <th style="width: 8%; text-align: center">Status</th>
        <th style="width: 12%">Submitted At</th>
      </tr>
    </thead>
    <tbody>
      @forelse ($evaluations as $evaluation)
        @php ($studentOjt = $evaluation->studentOjt)
        <tr>
          <td>{{ $evaluation->id }}</td>
          <td>
            {{
              $studentOjt?->student?->full_name ??
                "N/A"
            }}
          </td>
          <td>
            {{
              $studentOjt?->office?->name ??
                "N/A"
            }}
          </td>
          <td>
            {{
              $studentOjt?->supervisor?->full_name ??
                "Unassigned"
            }}
          </td>
          @foreach ($criteria as $criterion)
            @php ($field = \App\Support\EvaluationCriteria::databaseKey( $criterion["key"] ))
            <td style="text-align: center">
              {{
                $evaluation->criteria_scores[$criterion["key"]] ??
                  ($evaluation->{$field} ?? 0)
              }}
            </td>
          @endforeach
          <td style="text-align: center">
            {{
              $evaluation->total_points ??
                "—"
            }}{{ "/100" }}
          </td>
          <td style="text-align: center">
            {{
              ucfirst(
                $evaluation->status?->value ?? "not started",
              )
            }}
          </td>
          <td>
            {{
              $evaluation->submitted_at
                ? \Carbon\Carbon::parse($evaluation->submitted_at)->format("M d, Y - g:i A")
                : "N/A"
            }}
          </td>
        </tr>
      @empty
        <tr>
          <td colspan="{{ 6 + count($criteria) }}" style="text-align: center">
            No evaluations found.
          </td>
        </tr>
      @endforelse
    </tbody>
  </table>
@endsection
