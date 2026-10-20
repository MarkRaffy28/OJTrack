@extends ("layouts.pdf")

@section ("title", "Student OJT Assignments Report")
@section ("header_title", "Student OJT Assignments")

@section ("content")
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Student</th>
        <th>Supervisor</th>
        <th>Office</th>
        <th>Academic Year</th>
        <th>Term</th>
        <th>Required Hours</th>
        <th>Rendered Hours</th>
        <th>Progress</th>
        <th>Status</th>
        <th>Start Date</th>
        <th>End Date</th>
      </tr>
    </thead>
    <tbody>
      @forelse ($studentOjts as $assignment)
        <tr>
          <td>{{ $assignment->id }}</td>
          <td>
            {{
              $assignment->student?->full_name ??
                "N/A"
            }}
          </td>
          <td>
            {{
              $assignment->supervisor?->full_name ??
                "Unassigned"
            }}
          </td>
          <td>
            {{
              $assignment->office?->name ??
                "N/A"
            }}
          </td>
          <td>
            {{
              $assignment->academic_year ??
                "N/A"
            }}
          </td>
          <td>
            {{
              $assignment->term?->value ??
                $assignment->term
            }}
          </td>
          <td>
            {{
              number_format(
                (float) $assignment->required_hours,
                2,
              )
            }} hrs
          </td>
          <td>
            {{
              number_format(
                $assignment->rendered_hours,
                2,
              )
            }} hrs
          </td>
          <td>{{ $assignment->progress_percent }}%</td>
          <td>
            {{
              $assignment->status->value ??
                $assignment->status
            }}
          </td>
          <td>
            {{
              $assignment->start_date
                ? \Carbon\Carbon::parse($assignment->start_date)->format("M d, Y")
                : "N/A"
            }}
          </td>
          <td>
            {{
              $assignment->end_date
                ? \Carbon\Carbon::parse($assignment->end_date)->format("M d, Y")
                : "N/A"
            }}
          </td>
        </tr>
      @empty
        <tr>
          <td colspan="12" style="text-align: center">
            No student OJT assignments found.
          </td>
        </tr>
      @endforelse
    </tbody>
  </table>
@endsection
