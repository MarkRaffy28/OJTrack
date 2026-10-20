<?php

namespace App\Support;

use App\Models\EvaluationCriteriaConfig;

class EvaluationCriteria {
  public static function defaults(): array {
    return [
      ['key' => 'quality', 'label' => 'Quality', 'points' => 40, 'description' => 'Overall performance and quality of assigned work.'],
      ['key' => 'productivity', 'label' => 'Productivity', 'points' => 20, 'description' => 'Volume of useful work completed.'],
      ['key' => 'initiative', 'label' => 'Initiative', 'points' => 20, 'description' => 'Willingness to learn and contribute.'],
      ['key' => 'timeManagementPunctuality', 'label' => 'Time Management / Punctuality', 'points' => 10, 'description' => 'Dependability and effective use of time.'],
      ['key' => 'properAttireGrooming', 'label' => 'Proper Attire / Grooming', 'points' => 10, 'description' => 'Professional workplace appearance.'],
    ];
  }

  public static function get(): array {
    $criteria = EvaluationCriteriaConfig::query()->whereKey(1)->value('criteria');
    $criteria = is_string($criteria) ? json_decode($criteria, true) : $criteria;
    return self::isValid($criteria) ? $criteria : self::defaults();
  }

  public static function isValid(mixed $criteria): bool {
    if (!is_array($criteria) || count($criteria) === 0) return false;
    $keys = array_column($criteria, 'key');
    if (count($keys) !== count(array_unique($keys))) return false;

    return array_sum(array_map(fn($item) => (int) ($item['points'] ?? 0), $criteria)) === 100
      && collect($criteria)->every(fn($item) =>
        is_array($item)
        && preg_match('/^[A-Za-z][A-Za-z0-9]*$/', (string) ($item['key'] ?? ''))
        && is_string($item['label'] ?? null) && trim($item['label']) !== ''
        && is_string($item['description'] ?? null)
        && is_int($item['points'] ?? null) && $item['points'] > 0
      );
  }

  public static function databaseKey(string $key): string {
    return strtolower((string) preg_replace('/[A-Z]/', '_$0', $key));
  }
}
