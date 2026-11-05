<?php

namespace App\Services\Documents;

use BackedEnum;
use DateTimeInterface;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use PhpOffice\PhpWord\Element\Table;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\SimpleType\Jc;
use PhpOffice\PhpWord\SimpleType\TblWidth;
use PhpOffice\PhpWord\Style\Table as TableStyle;
use PhpOffice\PhpWord\TemplateProcessor;
use RuntimeException;
use Stringable;
use ZipArchive;

abstract class DocumentGenerator {
  protected const TEMPLATE = 'default.docx';

  /**
   * Minimum top page margin in twips (1440 = 1").
   *
   * The template header (logos, title, subtitle, color bars) ends about 1.25"
   * from the top of the page. 2160 (1.5") keeps content clear of it on every
   * page. Set to null to keep the template's own margin.
   */
  protected const MARGIN_TOP = 2160;

  /**
   * Reference width in twips, used only to size columns relative to each
   * other. Tables are set to 100% width with autofit, so Word and
   * LibreOffice scale the columns to the actual page width.
   */
  protected const CONTENT_WIDTH = 9026;

  /** Narrowest allowed column, in twips. */
  protected const MIN_COL_WIDTH = 700;

  /** Text length cap used when weighing a column, so long text can't take over the table. */
  protected const MAX_WEIGHT = 40;

  protected const COLOR_BORDER = 'BFBFBF';
  protected const COLOR_HEADER_BG = 'D9E2F3';
  protected const COLOR_ZEBRA_BG = 'F7F9FC';
  protected const COLOR_FOOTER_BG = 'EAEFF7';
  protected const COLOR_ACCENT = '1F3864';

  abstract protected function build(
    PhpWord $document,
    array $data
  ): Table;

  protected function templatePath(): string {
    return storage_path(
      'app/templates/' . static::TEMPLATE
    );
  }

  public function generate(array $data): string {
    $templatePath = $this->templatePath();

    if (!File::exists($templatePath)) {
      throw new RuntimeException(
        "Document template not found: {$templatePath}"
      );
    }

    $directory = storage_path('app/temp/documents');

    File::ensureDirectoryExists($directory);

    $path = $directory . '/' . Str::uuid() . '.docx';

    try {
      $template = new TemplateProcessor($templatePath);

      $document = new PhpWord();

      $document->setDefaultFontName('Arial');
      $document->setDefaultFontSize(9);

      $content = $this->build($document, $data);

      $template->setComplexBlock('content', $content);

      $template->saveAs($path);

      $this->applyPageMargins($path);

      return $path;
    } catch (\Throwable $exception) {
      File::delete($path);

      throw $exception;
    }
  }

  public function download(array $data, string $filename) {
    $path = $this->generate($data);

    return response()
      ->download($path, $filename)
      ->deleteFileAfterSend(true);
  }

  /**
   * Raise the top page margin so content starts below the template header.
   *
   * TemplateProcessor cannot change section settings, so the saved file is
   * patched directly. The margin is only ever increased, never reduced.
   */
  protected function applyPageMargins(string $path): void {
    if (static::MARGIN_TOP === null) {
      return;
    }

    $zip = new ZipArchive();

    if ($zip->open($path) !== true) {
      throw new RuntimeException("Unable to open generated document: {$path}");
    }

    $xml = $zip->getFromName('word/document.xml');

    if ($xml !== false) {
      $xml = preg_replace_callback(
        '/<w:pgMar\b[^>]*>/',
        function (array $match): string {
          return preg_replace_callback(
            '/w:top="(-?\d+)"/',
            fn(array $top): string => 'w:top="'
            . max((int) $top[1], static::MARGIN_TOP)
            . '"',
            $match[0]
          );
        },
        $xml
      );

      $zip->addFromString('word/document.xml', $xml);
    }

    $zip->close();
  }

  /**
   * Create a container for the report content.
   *
   * Individual sections and tables are placed inside this table.
   */
  protected function createContent(PhpWord $document): Table {
    $section = $document->addSection();

    return $section->addTable([
      'borderSize' => 0,
      'borderColor' => 'FFFFFF',
      'cellMargin' => 0,
      'layout' => TableStyle::LAYOUT_AUTO,
      'width' => 100 * 50,
      'unit' => TblWidth::PERCENT,
    ]);
  }

  protected function addHeading(
    Table $content,
    string $text,
    int $level = 2
  ): void {
    $font = match ($level) {
      1 => ['bold' => true, 'size' => 16, 'color' => static::COLOR_ACCENT],
      2 => ['bold' => true, 'size' => 12, 'color' => static::COLOR_ACCENT],
      default => ['bold' => true, 'size' => 10],
    };

    $paragraph = [
      'spaceBefore' => $level === 1 ? 240 : 200,
      'spaceAfter' => 100,
      'keepNext' => true,
    ];

    if ($level <= 2) {
      $paragraph['borderBottomSize'] = $level === 1 ? 12 : 6;
      $paragraph['borderBottomColor'] = static::COLOR_ACCENT;
    }

    $content->addRow();

    $content->addCell()->addText($text, $font, $paragraph);
  }

  protected function addText(
    Table $content,
    string $text
  ): void {
    $content->addRow();

    $content->addCell()->addText(
      $text,
      [],
      ['spaceAfter' => 80]
    );
  }

  /**
   * Add a data table.
   *
   * The table is 100% of the page width and autofit. Column widths are
   * relative hints, so the table always fills the window.
   *
   * Per-column options, keyed by column index or header text:
   *   'align'      => 'left'|'center'|'right'|'both'  (default: numbers right, else left)
   *   'headerAlign'=> same values (default: same as 'align')
   *   'format'     => callable(mixed $value, array $row): mixed  (receives the raw value)
   *   'font'       => PhpWord font style for body cells, e.g. ['bold' => true, 'color' => 'C00000']
   *   'headerFont' => PhpWord font style merged into the header cell
   *   'cell'       => PhpWord cell style, e.g. ['bgColor' => 'FFF2CC']
   *   'weight'     => relative width, overrides the automatic width
   *
   * @param array<int, string> $headers
   * @param iterable           $rows
   * @param array<int, int|float>|null $weights Optional relative column
   *        widths (e.g. [1, 3, 2]). When null, widths are derived from content.
   * @param array<int|string, array<string, mixed>> $columns
   * @param array<int, string|array<string, mixed>> $footer Optional summary row.
   *        Each cell is a string or ['text' => ..., 'span' => 1, 'align' => 'left',
   *        'font' => [], 'cell' => []]. Spans must add up to the column count.
   */
  protected function addTable(
    Table $content,
    array $headers,
    iterable $rows,
    ?array $weights = null,
    array $columns = [],
    array $footer = []
  ): void {
    $headers = array_values($headers);

    $options = [];

    foreach ($headers as $i => $header) {
      $options[$i] = $columns[$i] ?? $columns[$header] ?? [];
    }

    $matrix = [];

    foreach ($rows as $row) {
      $row = array_values((array) $row);
      $cells = [];

      foreach ($headers as $i => $_) {
        $value = $row[$i] ?? null;
        $format = $options[$i]['format'] ?? null;

        $cells[] = $this->stringify(
          $format !== null ? $format($value, $row) : $value
        );
      }

      $matrix[] = $cells;
    }

    $widths = $this->columnWidths($headers, $matrix, $weights, $options);

    // Not cantSplit: this row holds the whole table, so it must be allowed
    // to break across pages. Otherwise Word moves the table to a new page
    // and leaves the headings alone on the previous one.
    $content->addRow();

    $table = $content->addCell()->addTable([
      'borderSize' => 4,
      'borderColor' => static::COLOR_BORDER,
      'cellMargin' => 70,
      'layout' => TableStyle::LAYOUT_AUTO,
      'width' => 100 * 50,
      'unit' => TblWidth::PERCENT,
    ]);

    $cellParagraph = ['spaceBefore' => 0, 'spaceAfter' => 0];

    $table->addRow(null, ['tblHeader' => true, 'cantSplit' => true]);

    foreach ($headers as $i => $header) {
      $option = $options[$i];
      $align = $option['headerAlign'] ?? $option['align'] ?? 'left';

      $table->addCell($widths[$i], [
        'bgColor' => static::COLOR_HEADER_BG,
        'valign' => 'center',
      ])->addText(
          $header,
          ['bold' => true, 'size' => 8] + ($option['headerFont'] ?? []),
          $cellParagraph + ['alignment' => $align]
        );
    }

    if ($matrix === []) {
      $table->addRow();

      $table->addCell(array_sum($widths), [
        'gridSpan' => count($headers),
      ])->addText(
          'No records found.',
          ['italic' => true, 'size' => 8, 'color' => '777777'],
          $cellParagraph + ['alignment' => Jc::CENTER]
        );

      $this->addSpacer($content);

      return;
    }

    foreach ($matrix as $index => $row) {
      $table->addRow(null, ['cantSplit' => true]);

      foreach ($headers as $i => $_) {
        $option = $options[$i];
        $text = $row[$i];

        $style = ['valign' => 'center'];

        if ($index % 2 === 1) {
          $style['bgColor'] = static::COLOR_ZEBRA_BG;
        }

        $style = ($option['cell'] ?? []) + $style;

        $align = $option['align']
          ?? ($this->isNumeric($text) ? 'right' : 'left');

        $table->addCell($widths[$i], $style)->addText(
          $text,
          ($option['font'] ?? []) + ['size' => 8],
          $cellParagraph + ['alignment' => $align]
        );
      }
    }

    if ($footer !== []) {
      $this->addFooterRow($table, $footer, $widths);
    }

    $this->addSpacer($content);
  }

  /**
   * @param array<int, string|array<string, mixed>> $footer
   * @param array<int, int> $widths
   */
  protected function addFooterRow(
    Table $table,
    array $footer,
    array $widths
  ): void {
    $table->addRow(null, ['cantSplit' => true]);

    $column = 0;

    foreach ($footer as $cell) {
      $cell = is_array($cell) ? $cell : ['text' => $cell];
      $span = max(1, (int) ($cell['span'] ?? 1));

      $style = [
        'valign' => 'center',
        'bgColor' => static::COLOR_FOOTER_BG,
        'borderTopSize' => 12,
        'borderTopColor' => static::COLOR_ACCENT,
      ];

      if ($span > 1) {
        $style['gridSpan'] = $span;
      }

      $table->addCell(
        array_sum(array_slice($widths, $column, $span)),
        ($cell['cell'] ?? []) + $style
      )->addText(
          $this->stringify($cell['text'] ?? ''),
          ($cell['font'] ?? []) + ['bold' => true, 'size' => 8],
          [
            'spaceBefore' => 0,
            'spaceAfter' => 0,
            'alignment' => $cell['align'] ?? 'left',
          ]
        );

      $column += $span;
    }
  }

  /** Small gap so consecutive tables don't touch. */
  protected function addSpacer(Table $content): void {
    $content->addRow();
    $content->addCell()->addText('', ['size' => 4]);
  }

  /**
   * Calculate relative column widths in twips that sum to CONTENT_WIDTH.
   *
   * Each column gets a minimum width, and the remaining space is split
   * by weight. Weight is the longest word or the capped text length,
   * whichever is larger, so words are not broken mid-way.
   *
   * @return array<int, int>
   */
  protected function columnWidths(
    array $headers,
    array $matrix,
    ?array $weights,
    array $options = []
  ): array {
    $count = count($headers);

    if ($count === 0) {
      return [];
    }

    if ($weights === null) {
      $weights = [];

      foreach (array_values($headers) as $i => $header) {
        $length = mb_strlen($header);
        $longestWord = $this->longestWord($header);

        foreach ($matrix as $row) {
          $text = $row[$i] ?? '';
          $length = max($length, mb_strlen($text));
          $longestWord = max($longestWord, $this->longestWord($text));
        }

        $weights[] = max($longestWord, min($length, static::MAX_WEIGHT), 3);
      }
    }

    $weights = array_values($weights);

    foreach ($weights as $i => $weight) {
      $weights[$i] = $options[$i]['weight'] ?? $weight;
    }

    $total = static::CONTENT_WIDTH;
    $min = min(static::MIN_COL_WIDTH, intdiv($total, $count));
    $spare = $total - ($min * $count);
    $sum = array_sum($weights) ?: $count;

    $widths = [];

    foreach ($weights as $weight) {
      $widths[] = $min + (int) floor($spare * $weight / $sum);
    }

    // Put rounding remainder in the last column.
    $widths[$count - 1] += $total - array_sum($widths);

    return $widths;
  }

  protected function longestWord(string $text): int {
    $words = preg_split('/\s+/u', trim($text)) ?: [];

    return $words === [] ? 0 : max(array_map('mb_strlen', $words));
  }

  protected function isNumeric(string $text): bool {
    return (bool) preg_match('/^[-+]?[\d,]+(\.\d+)?%?$/', $text);
  }

  protected function stringify(mixed $value): string {
    if ($value === null || $value === '') {
      return '—';
    }

    if ($value instanceof BackedEnum) {
      return (string) $value->value;
    }

    if ($value instanceof DateTimeInterface) {
      return $value->format('Y-m-d H:i');
    }

    if ($value instanceof Stringable) {
      return (string) $value;
    }

    if (is_scalar($value)) {
      return (string) $value;
    }

    return '—';
  }
}