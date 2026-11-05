<?php

namespace App\Services\Documents;

use PhpOffice\PhpWord\Element\Table;
use PhpOffice\PhpWord\PhpWord;

class StudentOjtDocumentGenerator extends DocumentGenerator {
  protected function build(
    PhpWord $document,
    array $data
  ): Table {
    /** @var iterable<int, \App\Models\StudentOjt> $studentOjts */
    $studentOjts = $data['studentOjts'];

    $content = $this->createContent($document);

    $this->addHeading($content, 'Student OJT List', 1);

    $this->addText(
      $content,
      'Generated: ' . now()->format('F d, Y h:i A')
    );

    $rows = [];

    foreach ($studentOjts as $studentOjt) {
      $rows[] = [
        $studentOjt->id,
        $studentOjt->student?->full_name ?? 'N/A',
        $studentOjt->supervisor?->full_name ?? 'Unassigned',
        $studentOjt->office?->name ?? 'N/A',
        $studentOjt->academic_year ?? 'N/A',
        $studentOjt->term,
        $studentOjt->required_hours,
        $studentOjt->rendered_hours,
        $studentOjt->progress_percent,
        $studentOjt->status,
        $studentOjt->start_date,
        $studentOjt->end_date,
      ];
    }

    $hours = fn($value) => number_format((float) $value, 2) . ' hrs';
    $date = fn($value) => $value ? $value->format('M d, Y') : 'N/A';
    $enum = fn($value) => $value === null
      ? 'N/A'
      : ucfirst($this->stringify($value));

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
        'Term' => ['align' => 'center', 'format' => $enum],
        'Required Hours' => ['align' => 'right', 'format' => $hours],
        'Rendered Hours' => ['align' => 'right', 'format' => $hours],
        'Progress' => [
          'align' => 'right',
          'format' => fn($value) => (float) $value . '%',
        ],
        'Status' => ['align' => 'center', 'format' => $enum],
        'Start Date' => ['align' => 'center', 'format' => $date],
        'End Date' => ['align' => 'center', 'format' => $date],
      ]
    );

    return $content;
  }
}