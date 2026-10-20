@extends ("layouts.pdf")

@section ("title", "Offices Report")
@section ("header_title", "Office List")

@php
  /** @var \Illuminate\Database\Eloquent\Collection<int, \App\Models\Office> $offices */
@endphp

@section ("content")
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Address</th>
        <th>Email</th>
        <th>Contact Phone</th>
        <th>Morning Shift</th>
        <th>Afternoon Shift</th>
        <th>Supervisors</th>
      </tr>
    </thead>
    <tbody>
      @foreach ($offices as $office)
        <tr>
          <td>{{ $office->id }}</td>
          <td>{{ $office->name }}</td>
          <td>{{ $office->address }}</td>
          <td>{{ $office->contact_email }}</td>
          <td>{{ $office->contact_phone }}</td>
          <td>{{ $office->morning_shift }}</td>
          <td>{{ $office->afternoon_shift }}</td>
          <td>{{ $office->supervisor_details_count }}</td>
        </tr>
      @endforeach
    </tbody>
  </table>
@endsection
