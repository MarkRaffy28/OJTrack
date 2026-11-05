<?php

namespace App\Services\Documents;

use App\Models\StudentOjt;
use App\Support\EvaluationCriteria;
use Carbon\Carbon;
use PhpOffice\PhpWord\Element\Table;
use PhpOffice\PhpWord\PhpWord;

class EvaluationDocumentGenerator extends DocumentGenerator {
  /** Number of columns before the criteria columns (ID, Student, Office, Supervisor). */
  private const LEADING_COLUMNS = 4;

  protected function build(
    PhpWord $document,
    array $data
  ): Table {
    /** @var iterable<int, \App\Models\Evaluation|StudentOjt> $evaluations */
    $evaluations = $data['evaluations'];

    $criteria = $data['criteria'] ?? EvaluationCriteria::get();

    $content = $this->createContent($document);

    $this->addHeading($content, 'Supervisor Evaluations', 1);

    $this->addText(
      $content,
      'Generated: ' . now()->format('F d, Y h:i A')
    );

    $headers = ['ID', 'Student', 'Office', 'Supervisor'];

    // Columns are keyed by index because criteria labels may repeat.
    $columns = [0 => ['align' => 'center']];

    foreach ($criteria as $i => $criterion) {
      $headers[] = $criterion['label'] . ' (' . $criterion['points'] . ' pts)';

      $columns[self::LEADING_COLUMNS + $i] = [
        'align' => 'center',
        'headerFont' => ['size' => 7],
      ];
    }

    $headers[] = 'Total';
    $headers[] = 'Status';
    $headers[] = 'Submitted At';

    $total = count($headers);

    $columns[$total - 3] = ['align' => 'center'];
    $columns[$total - 2] = ['align' => 'center'];

    $rows = [];

    foreach ($evaluations as $item) {
      // The list may hold Evaluation models (with a studentOjt relation) or
      // StudentOjt models (with an evaluation relation).
      if ($item instanceof StudentOjt) {
        $studentOjt = $item;
        $evaluationRecord = $item->evaluation;
      } else {
        $studentOjt = $item->studentOjt;
        $evaluationRecord = $item;
      }

      // Evaluation is the parent record; scores and submission metadata are
      // stored on its supervisor EvaluationDetail.
      $detail = $evaluationRecord?->details?->first(
        fn($detail) => $detail->evaluation_type === 'supervisor'
      );

      $row = [
        $evaluationRecord?->id ?? $studentOjt?->id,
        $studentOjt?->student?->full_name ?? 'N/A',
        $studentOjt?->office?->name ?? 'N/A',
        $studentOjt?->supervisor?->full_name ?? 'Unassigned',
      ];

      foreach ($criteria as $criterion) {
        $field = EvaluationCriteria::databaseKey($criterion['key']);

        $row[] = $detail?->criteria_scores[$criterion['key']]
          ?? ($detail?->{$field} ?? 0);
      }

      $row[] = ($detail?->total_points ?? '—') . '/100';
      $row[] = ucfirst($detail?->status?->value ?? 'not started');
      $row[] = $detail?->submitted_at
        ? Carbon::parse($detail->submitted_at)->format('M d, Y - g:i A')
        : 'N/A';

      $rows[] = $row;
    }

    $this->addTable($content, $headers, $rows, null, $columns);

    return $content;
  }
}
