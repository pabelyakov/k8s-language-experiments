package com.meetup.beervote.web;

import com.meetup.beervote.dto.ApiDtos.CreateUserRequest;
import com.meetup.beervote.dto.ApiDtos.UserListResponse;
import com.meetup.beervote.dto.ApiDtos.UserResponse;
import com.meetup.beervote.user.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse create(@RequestBody CreateUserRequest request) {
        return userService.create(request);
    }

    @GetMapping
    public UserListResponse list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(name = "page_size", defaultValue = "20") int pageSize,
            @RequestParam(defaultValue = "created_at") String sort,
            @RequestParam(defaultValue = "desc") String order
    ) {
        return userService.list(page, pageSize, sort, order);
    }
}
