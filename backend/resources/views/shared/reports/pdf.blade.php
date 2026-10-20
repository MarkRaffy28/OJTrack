@extends ("layouts.pdf")

@section ("title", "Reports List")
@section ("header_title", "Student Reports")

@section ("content")
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Student</th>
        <th>Type</th>
        <th>Report Date</th>
        <th>Deadline</th>
        <th>Status</th>
        <th>Reviewed By</th>
        <th>Reviewed At</th>
      </tr>
    </thead>
    <tbody>
      @forelse ($reports as $report)
        <tr>
          <td>{{ $report->id }}</td>
          <td>
            {{
              $report->student?->full_name ??
                "N/A"
            }}
          </td>
          <td>
            {{
              $report->type?->value ??
                $report->type
            }}
          </td>
          <td>
            {{
              $report->report_date
                ? \Carbon\Carbon::parse($report->report_date)->format("M d, Y")
                : "N/A"
            }}
          </td>
          <td>
            {{
              $report->deadline
                ? \Carbon\Carbon::parse($report->deadline)->format("M d, Y")
                : "N/A"
            }}
          </td>
          <td>
            {{
              $report->status?->value ??
                $report->status
            }}
          </td>
          <td>
            {{
              $report->reviewer?->full_name ??
                "Pending Review"
            }}
          </td>
          <td>
            {{
              $report->reviewed_at
                ? \Carbon\Carbon::parse($report->reviewed_at)->format("M d, Y h:i A")
                : "N/A"
            }}
          </td>
        </tr>
      @empty
        <tr>
          <td colspan="8" style="text-align: center">No reports found.</td>
        </tr>
      @endforelse
    </tbody>
  </table>
@endsection
