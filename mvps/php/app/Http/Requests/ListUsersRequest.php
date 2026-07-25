<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class ListUsersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'page' => $this->query('page', 1),
            'page_size' => $this->query('page_size', 20),
            'sort' => $this->query('sort', 'created_at'),
            'order' => $this->query('order', 'desc'),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'page' => ['required', 'integer', 'min:1'],
            'page_size' => ['required', 'integer', 'min:1', 'max:100'],
            'sort' => ['required', 'string', 'in:name,created_at,id'],
            'order' => ['required', 'string', 'in:asc,desc'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'page.min' => 'page must be >= 1',
            'page.integer' => 'page must be >= 1',
            'page_size.min' => 'page_size must be 1..100',
            'page_size.max' => 'page_size must be 1..100',
            'page_size.integer' => 'page_size must be 1..100',
            'sort.in' => 'sort must be one of: name, created_at, id',
            'order.in' => 'order must be one of: asc, desc',
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
