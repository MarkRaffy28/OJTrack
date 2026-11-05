<?php

namespace App\Services;

use App\Enums\ActivityAction;
use App\Models\Activity;
use App\Models\StudentOjt;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class ActivityService {
  public function log(
    User $actor,
    ActivityAction $action,
    ?Model $subject = null,
    ?StudentOjt $ojt = null,
    array $properties = [],
  ): Activity {
    if ($subject && $action->tracksChanges()) {
      $properties = array_merge(
        $this->getChanges($subject),
        $properties,
      );
    }

    return Activity::create([
      'user_id' => $actor->id,
      'ojt_id' => $ojt?->id,
      'action' => $action,
      'subject_id' => $subject?->getKey(),
      'subject_type' => $subject?->getMorphClass(),
      'description' => $action->description(),
      'properties' => $properties ?: null,
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);
  }

  private function getChanges(Model $subject): array {
    $changes = [];

    foreach ($subject->getChanges() as $attribute => $after) {
      if (in_array($attribute, ['updated_at'], true)) {
        continue;
      }

      $before = $subject->getPrevious()[$attribute] ?? null;

      // Ignore attributes that haven't actually changed.
      if ($before === $after) {
        continue;
      }

      $changes[$attribute] = [
        'before' => $before,
        'after' => $after,
      ];
    }

    return $changes ? ['changes' => $changes] : [];
  }
}