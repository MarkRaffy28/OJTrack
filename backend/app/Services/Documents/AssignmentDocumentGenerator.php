<?php

namespace App\Services\Documents;

use Carbon\Carbon;
use PhpOffice\PhpWord\Element\Table;
use PhpOffice\PhpWord\PhpWord;

class AssignmentDocumentGenerator extends DocumentGenerator {
  protected function build(
    PhpWord $document,
    array $data
  ): Table {
    /** @var iterable<int, \App\Models\StudentOjt> $assignments */
    $assignments = $data['studentOjts'];

    $content = $this->createContent($document);

    $this->addHeading($content, 'Student OJT Assignments', 1);

    $this->addText(
      $content,
      'Generated: ' . now()->format('F d, Y h:i A')
    );

    $rows = [];

    foreach ($assignments as $assignment) {
      $rows[] = [
        $assignment->id,
        $assignment->student?->full_name ?? 'N/A',
        $assignment->supervisor?->full_name ?? 'Unassigned',
        $assignment->office?->name ?? 'N/A',
        $assignment->academic_year ?? 'N/A',
        $assignment->term,
        $assignment->required_hours,
        $assignment->rendered_hours,
        $assignment->progress_percent,
        $assignment->status,
        $assignment->start_date,
        $assignment->end_date,
      ];
    }

    $hours = fn($value) => number_format((float) $value, 2) . ' hrs';
    $date = fn($value) => $value
      ? Carbon::parse($value)->format('M d, Y')
      : 'N/A';

    $this->addTable(
      $content,
      [
        'ID',
        'Student',
        'Supervisor',
        'Office',
        'Academic Year',
        'Term',
        'Required Hours',
        'Rendered Hours',
        'Progress',
        'Status',
        'Start Date',
        'End Date',
      ],
      $rows,
      null,
      [
        'ID' => ['align' => 'center'],
        'Academic Year' => ['align' => 'center'],
        'Term' => ['align' => 'center'],
        'Required Hours' => ['align' => 'right', 'format' => $hours],
        'Rendered Hours' => ['align' => 'right', 'format' => $hours],
        'Progress' => [
          'align' => 'right',
          'format' => fn($value) => (float) $value . '%',
        ],
        'Status' => [
          'align' => 'center',
          'format' => fn($value) => ucfirst($this->stringify($value)),
        ],
        'Start Date' => ['align' => 'center', 'format' => $date],
        'End Date' => ['align' => 'center', 'format' => $date],
      ]
    );

    return $content;
  }
}