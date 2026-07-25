<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class CreateVoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'user_id' => ['required', 'uuid'],
            'beer_id' => ['required', 'integer'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'user_id.required' => 'user_id is required',
            'user_id.uuid' => 'user_id is required',
            'beer_id.required' => 'beer_id must be one of the nominees (1..10)',
            'beer_id.integer' => 'beer_id must be one of the nominees (1..10)',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        $message = $validator->errors()->first() ?: 'validation failed';

        throw new HttpResponseException(response()->json([
            'error' => $message,
            'status' => 400,
        ], 400));
    }
}
