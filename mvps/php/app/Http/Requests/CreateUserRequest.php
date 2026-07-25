<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class CreateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('name') && is_string($this->input('name'))) {
            $this->merge(['name' => trim($this->input('name'))]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:1', 'max:64'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'name is required',
            'name.string' => 'name is required',
            'name.min' => 'name must be 1..64 characters after trim',
            'name.max' => 'name must be 1..64 characters after trim',
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
