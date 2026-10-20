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
  ): Activity {
    return Activity::create([
      'user_id' => $actor->id,
      'ojt_id' => $ojt?->id,
      'action' => $action,
      'subject_id' => $subject?->getKey(),
      'subject_type' => $subject?->getMorphClass(),
      'description' => $action->description(),
    ]);
  }
}
