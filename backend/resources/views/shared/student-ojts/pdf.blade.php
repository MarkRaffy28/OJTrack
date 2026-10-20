@extends ("layouts.pdf")

@section ("title", "Student OJT List Report")
@section ("header_title", "Student OJT List")

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
      @forelse ($studentOjts as $studentOjt)
        <tr>
          <td>{{ $studentOjt->id }}</td>
          <td>
            {{
              $studentOjt->student?->full_name ??
                "N/A"
            }}
          </td>
          <td>
            {{
              $studentOjt->supervisor?->full_name ??
                "Unassigned"
            }}
          </td>
          <td>
            {{
              $studentOjt->office?->name ??
                "N/A"
            }}
          </td>
          <td>
            {{
              $studentOjt->academic_year ??
                "N/A"
            }}
          </td>
          <td>
            {{
              $studentOjt->term instanceof \UnitEnum 
                ? $studentOjt->term->value 
                : ($studentOjt->term ?? "N/A")
            }}
          </td>
          <td>
            {{
              number_format(
                (float) $studentOjt->required_hours,
                2,
              )
            }} hrs
          </td>
          <td>
            {{
              number_format(
                $studentOjt->rendered_hours,
                2,
              )
            }} hrs
          </td>
          <td>{{ $studentOjt->progress_percent }}%</td>
          <td>
            {{
              $studentOjt->status instanceof \UnitEnum 
                ? $studentOjt->status->value 
                : ($studentOjt->status ?? "N/A")
            }}
          </td>
          <td>
            {{
              $studentOjt->start_date?->format("M d, Y") ??
                "N/A"
            }}
          </td>
          <td>
            {{
              $studentOjt->end_date?->format("M d, Y") ??
                "N/A"
            }}
          </td>
        </tr>
      @empty
        <tr>
          <td colspan="12" style="text-align: center">
            No student OJTs found. Try changing your search or filters.
          </td>
        </tr>
      @endforelse
    </tbody>
  </table>
@endsection
