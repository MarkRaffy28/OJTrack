<?php

namespace App\Services\Documents;

use App\Enums\UserRole;
use App\Models\User;
use PhpOffice\PhpWord\Element\Table;
use PhpOffice\PhpWord\PhpWord;

class UserDocumentGenerator extends DocumentGenerator {
  protected function build(
    PhpWord $document,
    array $data
  ): Table {
    /** @var \Illuminate\Database\Eloquent\Collection<int, User> $users */
    $users = $data['users'];

    $content = $this->createContent($document);

    $this->addHeading($content, 'User List', 1);

    $this->addText(
      $content,
      'Generated: ' . now()->format('F d, Y h:i A')
    );

    $this->addUserSection(
      $content,
      'Students',
      $users->where('role', UserRole::STUDENT),
      [
        'ID',
        'User ID',
        'Name',
        'Contact Number',
        'Email',
        'Present Address',
        'Program',
        'Year',
        'Section',
        'Status',
      ],
      fn(User $user) => [
        $user->id,
        $user->user_id,
        $user->full_name,
        $user->contact_number,
        $user->email,
        $user->present_address,
        $user->studentDetail?->program,
        $user->studentDetail?->year,
        $user->studentDetail?->section,
        $user->status,
      ],
      [
        'ID' => ['align' => 'center'],
        'Year' => ['align' => 'center'],
        'Section' => ['align' => 'center'],
        'Status' => $this->statusColumn(),
      ]
    );

    $this->addUserSection(
      $content,
      'Supervisors',
      $users->where('role', UserRole::SUPERVISOR),
      [
        'ID',
        'User ID',
        'Name',
        'Contact Number',
        'Email',
        'Present Address',
        'Office',
        'Position',
        'Status',
      ],
      fn(User $user) => [
        $user->id,
        $user->user_id,
        $user->full_name,
        $user->contact_number,
        $user->email,
        $user->present_address,
        $user->supervisorDetail?->office?->name,
        $user->supervisorDetail?->position,
        $user->status,
      ],
      [
        'ID' => ['align' => 'center'],
        'Status' => $this->statusColumn(),
      ]
    );

    $this->addUserSection(
      $content,
      'Instructors',
      $users->where('role', UserRole::INSTRUCTOR),
      [
        'ID',
        'User ID',
        'Name',
        'Contact Number',
        'Email',
        'Present Address',
        'Program',
        'Department',
        'Section',
        'Status',
      ],
      fn(User $user) => [
        $user->id,
        $user->user_id,
        $user->full_name,
        $user->contact_number,
        $user->email,
        $user->present_address,
        $user->instructorDetail?->program?->name
        ?? $user->instructorDetail?->program,
        $user->instructorDetail?->department,
        $user->instructorDetail?->section,
        $user->status,
      ],
      [
        'ID' => ['align' => 'center'],
        'Section' => ['align' => 'center'],
        'Status' => $this->statusColumn(),
      ]
    );

    return $content;
  }

  /**
   * @param array<int|string, array<string, mixed>> $columns Per-column
   *        options keyed by header text or index. See DocumentGenerator::addTable().
   */
  private function addUserSection(
    Table $content,
    string $title,
    iterable $users,
    array $headers,
    callable $map,
    array $columns = []
  ): void {
    $rows = [];

    foreach ($users as $user) {
      $rows[] = $map($user);
    }

    if (empty($rows)) {
      return;
    }

    $this->addHeading($content, $title);

    $this->addTable($content, $headers, $rows, null, $columns);
  }

  /** @return array<string, mixed> */
  private function statusColumn(): array {
    return [
      'align' => 'center',
      'format' => fn($value) => ucfirst($this->stringify($value)),
    ];
  }
}