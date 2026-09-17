<?php

namespace App\Http\Requests\Attendance;

use App\Http\Requests\BaseApiRequest;

class QRAttendanceRequest extends BaseApiRequest {
  public function authorize(): bool {
    return true;
  }

  public function rules(): array {
    return [
      'qrPayload' => ['required', 'string'],
    ];
  }
}
