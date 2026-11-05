<?php

namespace App\Services\Documents;

use Carbon\Carbon;
use Illuminate\Support\Collection;
use PhpOffice\PhpWord\Element\Table;
use PhpOffice\PhpWord\PhpWord;

class AttendanceDocumentGenerator extends DocumentGenerator {
  protected function build(
    PhpWord $document,
    array $data
  ): Table {
    /** @var Collection<int, \App\Models\Attendance> $attendances */
    $attendances = collect($data['attendances']);

    $content = $this->createContent($document);

    $this->addHeading($content, 'Attendance Logs', 1);

    $this->addText(
      $content,
      'Generated: ' . now()->format('F d, Y h:i A')
    );

    if ($attendances->isEmpty()) {
      $this->addText($content, 'No attendance records found.');

      return $content;
    }

    $grouped = $attendances->groupBy(
      fn($attendance) => $attendance->student?->id ?? 'unknown'
    );

    foreach ($grouped as $records) {
      $this->addStudentSection($content, $records);
    }

    return $content;
  }

  /**
   * @param Collection<int, \App\Models\Attendance> $records
   */
  private function addStudentSection(
    Table $content,
    Collection $records
  ): void {
    $first = $records->first();

    $this->addStudentCaption(
      $content,
      $first->student?->full_name ?? 'Unknown Student',
      'Office: ' . ($first->ojt?->office?->name ?? 'Unassigned')
      . ' | Supervisor: '
      . ($first->ojt?->supervisor?->full_name ?? 'Unassigned')
    );

    $statusCounts = $records
      ->flatMap(fn($attendance) => $attendance->attendance_statuses)
      ->countBy()
      ->map(fn($count, $status) => ucfirst($status) . ': ' . $count)
      ->implode(', ');

    $rows = $records
      ->map(fn($attendance) => [
        $attendance->date?->format('M d, Y') ?? 'N/A',
        $this->session($attendance->morning_in, $attendance->morning_out),
        $this->session($attendance->afternoon_in, $attendance->afternoon_out),
        $this->hours($attendance->total_hours),
        $this->hours($attendance->approved_hours),
        implode(
          ', ',
          array_map('ucfirst', $attendance->attendance_statuses)
        ),
      ])
      ->all();

    $this->addTable(
      $content,
      [
        'Date',
        'AM Session',
        'PM Session',
        'Total Logged Hours',
        'Approved Hours',
        'Status',
      ],
      $rows,
      null,
      [
        'Date' => ['align' => 'center'],
        'AM Session' => ['align' => 'center'],
        'PM Session' => ['align' => 'center'],
        'Total Logged Hours' => ['align' => 'right'],
        'Approved Hours' => ['align' => 'right', 'font' => ['bold' => true]],
      ],
      [
        ['text' => 'Total Summary:', 'span' => 3, 'align' => 'right'],
        ['text' => $this->hours($records->sum('total_hours')), 'align' => 'right'],
        ['text' => $this->hours($records->sum('approved_hours')), 'align' => 'right'],
        $statusCounts ?: 'None',
      ]
    );
  }

  /** Student name in bold, followed by office and supervisor in muted text. */
  private function addStudentCaption(
    Table $content,
    string $name,
    string $details
  ): void {
    $content->addRow();

    $run = $content->addCell()->addTextRun([
      'spaceBefore' => 240,
      'spaceAfter' => 100,
      'keepNext' => true,
    ]);

    $run->addText($name, [
      'bold' => true,
      'size' => 11,
      'color' => '1E293B',
    ]);

    $run->addText("  ({$details})", [
      'size' => 9,
      'color' => '64748B',
    ]);
  }

  private function session(mixed $in, mixed $out): string {
    return $this->time($in) . ' – ' . $this->time($out);
  }

  private function time(mixed $value): string {
    return $value ? Carbon::parse($value)->format('g:i A') : '--:--';
  }

  private function hours(mixed $value): string {
    return number_format((float) $value, 1) . ' hrs';
  }
}