@extends ("layouts.pdf")

@section ("title", "Users Report")
@section ("header_title", "User List")

@php
  /** @var \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users */
  $students = $users->where("role", \App\Enums\UserRole::STUDENT);
  $supervisors = $users->where("role", \App\Enums\UserRole::SUPERVISOR);
  $instructors = $users->where("role", \App\Enums\UserRole::INSTRUCTOR);

  $commonColumns = [
    "ID" => "id",
    "User ID" => "user_id",
    "Name" => "full_name",
    "Contact Number" => "contact_number",
    "Email" => "email",
    "Present Address" => "present_address",
  ];
@endphp

@section ("content")
  {{-- Students --}}
  @if ($students->isNotEmpty())
    <h2>Students</h2>
    <table>
      <thead>
        <tr>
          @foreach ($commonColumns as $label => $field)
            <th>{{ $label }}</th>
          @endforeach
          <th>Program</th>
          <th>Year</th>
          <th>Section</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        @foreach ($students as $user)
          <tr>
            @foreach ($commonColumns as $field)
              <td>{{ $user->{$field} }}</td>
            @endforeach
            <td>
              {{
                $user->studentDetail
                  ?->program
              }}
            </td>
            <td>
              {{
                $user->studentDetail
                  ?->year
              }}
            </td>
            <td>
              {{
                $user->studentDetail
                  ?->section
              }}
            </td>
            <td>{{ $user->status->value }}</td>
          </tr>
        @endforeach
      </tbody>
    </table>
  @endif

  {{-- Supervisors --}}
  @if ($supervisors->isNotEmpty())
    <h2>Supervisors</h2>
    <table>
      <thead>
        <tr>
          @foreach ($commonColumns as $label => $field)
            <th>{{ $label }}</th>
          @endforeach
          <th>Office</th>
          <th>Position</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        @foreach ($supervisors as $user)
          <tr>
            @foreach ($commonColumns as $field)
              <td>{{ $user->{$field} }}</td>
            @endforeach
            <td>
              {{
                $user->supervisorDetail?->office
                  ?->name
              }}
            </td>
            <td>
              {{
                $user->supervisorDetail
                  ?->position
              }}
            </td>
            <td>{{ $user->status->value }}</td>
          </tr>
        @endforeach
      </tbody>
    </table>
  @endif

  {{-- Instructors --}}
  @if ($instructors->isNotEmpty())
    <h2>Instructors</h2>
    <table>
      <thead>
        <tr>
          @foreach ($commonColumns as $label => $field)
            <th>{{ $label }}</th>
          @endforeach
          <th>Department</th>
          <th>Section</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        @foreach ($instructors as $user)
          <tr>
            @foreach ($commonColumns as $field)
              <td>{{ $user->{$field} }}</td>
            @endforeach
            <td>
              {{
                $user->instructorDetail
                  ?->department
              }}
            </td>
            <td>
              {{
                $user->instructorDetail
                  ?->section
              }}
            </td>
            <td>{{ $user->status->value }}</td>
          </tr>
        @endforeach
      </tbody>
    </table>
  @endif
@endsection
