@extends('layouts.pdf')
@section('title', 'Student Evaluations')
@section('header_title', 'Student Evaluations')
@section('content')
  @forelse($evaluations as $studentOjt)
    @php($details = $studentOjt->evaluation?->details?->keyBy(fn($d) => $d->evaluation_type . ':' . ($d->period ?? 'supervisor')) ?? collect())
    <section style="page-break-after: always;"><h2>{{ $studentOjt->student?->full_name ?? 'Unknown student' }}</h2><p><strong>ID:</strong> {{ $studentOjt->id }} &nbsp; <strong>Office:</strong> {{ $studentOjt->office?->name ?? 'Unassigned' }}</p>@if($isAdmin)<p><strong>Instructor:</strong> {{ $studentOjt->instructor?->full_name ?? 'Unassigned' }}</p>@endif
      <table style="width:100%; margin-top:16px; border-collapse:collapse;"><thead><tr><th style="text-align:left; border-bottom:1px solid #999;">Evaluation</th><th style="text-align:left; border-bottom:1px solid #999;">Evaluator</th><th style="text-align:left; border-bottom:1px solid #999;">Status</th><th style="text-align:right; border-bottom:1px solid #999;">Points</th></tr></thead><tbody>@foreach([['Supervisor', 'supervisor', 'supervisor'], ['Instructor Midterm', 'instructor', 'midterm'], ['Instructor Final', 'instructor', 'final']] as [$label, $type, $period]) @php($detail = $details->get($type . ':' . $period))<tr><td style="padding:8px 0;">{{ $label }}</td><td>{{ $detail?->evaluator?->full_name ?? 'Pending' }}</td><td>{{ $detail?->status?->value ? ucfirst($detail->status->value) : 'Pending' }}</td><td style="text-align:right;">{{ $detail?->total_points !== null ? $detail->total_points . ' / 100' : '—' }}</td></tr>@endforeach</tbody></table>
    </section>
  @empty<p>No students found.</p>@endforelse
@endsection
