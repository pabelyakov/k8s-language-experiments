<?php

namespace App\Http\Controllers;

use App\Http\Requests\CreateUserRequest;
use App\Http\Requests\ListUsersRequest;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    public function __construct(
        private readonly UserService $users,
    ) {}

    public function store(CreateUserRequest $request): JsonResponse
    {
        $user = $this->users->create($request->validated('name'));

        return response()->json($user, 201);
    }

    public function index(ListUsersRequest $request): JsonResponse
    {
        $data = $request->validated();

        return response()->json($this->users->list(
            (int) $data['page'],
            (int) $data['page_size'],
            $data['sort'],
            $data['order'],
        ));
    }
}
