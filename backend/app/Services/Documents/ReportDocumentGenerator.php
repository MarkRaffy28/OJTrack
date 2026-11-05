<?php

namespace App\Services\Documents;

use Carbon\Carbon;
use PhpOffice\PhpWord\Element\Table;
use PhpOffice\PhpWord\PhpWord;

class ReportDocumentGenerator extends DocumentGenerator {
  protected function build(
    PhpWord $document,
    array $data
  ): Table {
    /** @var iterable<int, \App\Models\Report> $reports */
    $reports = $data['reports'];

    $content = $this->createContent($document);

    $this->addHeading($content, 'Student Reports', 1);

    $this->addText(
      $content,
      'Generated: ' . now()->format('F d, Y h:i A')
    );

    $rows = [];

    foreach ($reports as $report) {
      $rows[] = [
        $report->id,
        $report->student?->full_name ?? 'N/A',
        $report->type,
        $report->report_date,
        $report->deadline,
        $report->status,
        $report->reviewer?->full_name ?? 'Pending Review',
        $report->reviewed_at,
      ];
    }

    $date = fn($value) => $value
      ? Carbon::parse($value)->format('M d, Y')
      : 'N/A';

    $this->addTable(
      $content,
      [
        'ID',
        'Student',
        'Type',
        'Report Date',
        'Deadline',
        'Status',
        'Reviewed By',
        'Reviewed At',
      ],
      $rows,
      null,
      [
        'ID' => ['align' => 'center'],
        'Report Date' => ['align' => 'center', 'format' => $date],
        'Deadline' => ['align' => 'center', 'format' => $date],
        'Status' => [
          'align' => 'center',
          'format' => fn($value) => ucfirst($this->stringify($value)),
        ],
        'Reviewed At' => [
          'align' => 'center',
          'format' => fn($value) => $value
            ? Carbon::parse($value)->format('M d, Y h:i A')
            : 'N/A',
        ],
      ]
    );

    return $content;
  }
}