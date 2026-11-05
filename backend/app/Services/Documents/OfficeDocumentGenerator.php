<?php

namespace App\Services\Documents;

use PhpOffice\PhpWord\Element\Table;
use PhpOffice\PhpWord\PhpWord;

class OfficeDocumentGenerator extends DocumentGenerator {
  protected function build(
    PhpWord $document,
    array $data
  ): Table {
    /** @var iterable<int, \App\Models\Office> $offices */
    $offices = $data['offices'];

    $content = $this->createContent($document);

    $this->addHeading($content, 'Office List', 1);

    $this->addText(
      $content,
      'Generated: ' . now()->format('F d, Y h:i A')
    );

    $rows = [];

    foreach ($offices as $office) {
      $rows[] = [
        $office->id,
        $office->name,
        $office->address,
        $office->contact_email,
        $office->contact_phone,
        $office->morning_shift,
        $office->afternoon_shift,
        $office->supervisor_details_count,
      ];
    }

    $this->addTable(
      $content,
      [
        'ID',
        'Name',
        'Address',
        'Email',
        'Contact Phone',
        'Morning Shift',
        'Afternoon Shift',
        'Supervisors',
      ],
      $rows,
      null,
      [
        'ID' => ['align' => 'center'],
        'Morning Shift' => ['align' => 'center'],
        'Afternoon Shift' => ['align' => 'center'],
        'Supervisors' => ['align' => 'center'],
      ]
    );

    return $content;
  }
}