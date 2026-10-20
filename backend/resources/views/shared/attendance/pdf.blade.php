@php
  /** @var \Illuminate\Database\Eloquent\Collection<int, \App\Models\Attendance> $attendances */
  // Group attendances by student id (or fallback name)
  $groupedAttendances = $attendances->groupBy(function ($attendance) {
    return $attendance->student?->id ?? "unknown";
  });
@endphp

@extends ("layouts.pdf")

@section ("title", "Attendance Logs")
@section ("header_title", "Attendance Logs")

@section ("content")
  @forelse ($groupedAttendances as $studentId => $studentAttendances)
    @php
      $firstRecord = $studentAttendances->first();
      $studentName = $firstRecord->student?->full_name ?? "Unknown Student";
      $officeName = $firstRecord->ojt?->office?->name ?? "Unassigned";
      $supervisorName = $firstRecord->ojt?->supervisor?->full_name ?? "Unassigned";

      // Calculate student totals
      $totalApprovedHours = $studentAttendances->sum("approved_hours");
      $totalLoggedHours = $studentAttendances->sum("total_hours");

      // Aggregate status counts across all student records
      $statusCounts = $studentAttendances
        ->flatMap(function ($attendance) {
          return $attendance->attendance_statuses;
        })
        ->countBy()
        ->all();

      $formattedStatuses = collect($statusCounts)
        ->map(fn($count, $status) => ucfirst($status) . ": " . $count)
        ->implode(", ");
    @endphp

    {{-- Student Info Header Above Table --}}
    <div
      style="
        margin-top: 20px;
        margin-bottom: 6px;
        font-size: 1.1em;
        font-weight: bold;
        color: #1e293b;
      "
    >
      {{ $studentName }}
      <span style="font-weight: normal; font-size: 0.9em; color: #64748b"
        >(Office: {{ $officeName }} | Supervisor: {{ $supervisorName }})</span
      >
    </div>

    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>AM Session</th>
          <th>PM Session</th>
          <th>Total Logged Hours</th>
          <th>Approved Hours</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        @foreach ($studentAttendances as $attendance)
          <tr>
            <td>
              {{
                $attendance->date
                  ? $attendance->date->format("M d, Y")
                  : "N/A"
              }}
            </td>
            <td>
              {{
                $attendance->morning_in
                  ? \Carbon\Carbon::parse($attendance->morning_in)->format("g:i A")
                  : "--:--"
              }} &ndash; {{
                $attendance->morning_out
                  ? \Carbon\Carbon::parse($attendance->morning_out)->format("g:i A")
                  : "--:--"
              }}
            </td>
            <td>
              {{
                $attendance->afternoon_in
                  ? \Carbon\Carbon::parse($attendance->afternoon_in)->format("g:i A")
                  : "--:--"
              }} &ndash; {{
                $attendance->afternoon_out
                  ? \Carbon\Carbon::parse($attendance->afternoon_out)->format("g:i A")
                  : "--:--"
              }}
            </td>
            <td>
              {{
                number_format(
                  $attendance->total_hours,
                  1,
                )
              }} hrs
            </td>
            <td>
              <strong
                >{{
                  number_format(
                    $attendance->approved_hours,
                    1,
                  )
                }} hrs</strong
              >
            </td>
            <td>
              {{
                implode(
                  ", ",
                  array_map("ucfirst", $attendance->attendance_statuses),
                )
              }}
            </td>
          </tr>
        @endforeach

        {{-- Student Summary Row --}}
        <tr
          style="
            background-color: #f8fafc;
            font-weight: bold;
            border-top: 1.5px solid #cbd5e1;
          "
        >
          <td colspan="3" style="text-align: right">Total Summary:</td>
          <td>{{ number_format($totalLoggedHours, 1) }} hrs</td>
          <td>{{ number_format($totalApprovedHours, 1) }} hrs</td>
          <td>
            {{
              $formattedStatuses ?:
                "None"
            }}
          </td>
        </tr>
      </tbody>
    </table>

  @empty
    <table>
      <thead>
        <tr>
          <th>Attendance Logs</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align: center">No attendance records found.</td>
        </tr>
      </tbody>
    </table>
  @endforelse
@endsection
