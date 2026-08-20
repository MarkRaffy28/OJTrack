<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Override;

abstract class BaseApiRequest extends FormRequest {
  #[Override]
  protected function failedValidation(Validator $validator) {
    $errors = $validator->errors();

    throw new HttpResponseException(
      response()->json([
        'message' => $errors->first(),
        'errors' => $errors,
      ], 422),
    );
  }
}