package com.meetup.beervote.user;

import com.meetup.beervote.dto.ApiDtos.CreateUserRequest;
import com.meetup.beervote.dto.ApiDtos.UserListResponse;
import com.meetup.beervote.dto.ApiDtos.UserResponse;
import com.meetup.beervote.error.ApiException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserService {

    private final ConcurrentHashMap<UUID, User> users = new ConcurrentHashMap<>();

    public UserResponse create(CreateUserRequest request) {
        String name = validateName(request != null ? request.name() : null);
        User user = new User(UUID.randomUUID(), name, Instant.now());
        users.put(user.id(), user);
        return toResponse(user);
    }

    public Optional<User> findById(UUID id) {
        return Optional.ofNullable(users.get(id));
    }

    public boolean exists(UUID id) {
        return users.containsKey(id);
    }

    public UserListResponse list(int page, int pageSize, String sort, String order) {
        validatePagination(page, pageSize, sort, order);

        Comparator<User> comparator = comparatorFor(sort);
        if ("desc".equalsIgnoreCase(order)) {
            comparator = comparator.reversed();
        }

        List<User> sorted = new ArrayList<>(users.values());
        sorted.sort(comparator);

        long total = sorted.size();
        int totalPages = total == 0 ? 0 : (int) Math.ceil((double) total / pageSize);
        int from = Math.min((page - 1) * pageSize, sorted.size());
        int to = Math.min(from + pageSize, sorted.size());

        List<UserResponse> items = sorted.subList(from, to).stream()
                .map(this::toResponse)
                .toList();

        return new UserListResponse(items, page, pageSize, total, totalPages);
    }

    private String validateName(String name) {
        if (name == null) {
            throw new ApiException(400, "name is required");
        }
        String trimmed = name.trim();
        if (trimmed.isEmpty() || trimmed.length() > 64) {
            throw new ApiException(400, "name must be 1..64 characters after trim");
        }
        return trimmed;
    }

    private void validatePagination(int page, int pageSize, String sort, String order) {
        if (page < 1) {
            throw new ApiException(400, "page must be >= 1");
        }
        if (pageSize < 1 || pageSize > 100) {
            throw new ApiException(400, "page_size must be 1..100");
        }
        String normalizedSort = sort == null ? "" : sort.toLowerCase(Locale.ROOT);
        if (!normalizedSort.equals("name")
                && !normalizedSort.equals("created_at")
                && !normalizedSort.equals("id")) {
            throw new ApiException(400, "sort must be one of: name, created_at, id");
        }
        String normalizedOrder = order == null ? "" : order.toLowerCase(Locale.ROOT);
        if (!normalizedOrder.equals("asc") && !normalizedOrder.equals("desc")) {
            throw new ApiException(400, "order must be one of: asc, desc");
        }
    }

    private Comparator<User> comparatorFor(String sort) {
        return switch (sort.toLowerCase(Locale.ROOT)) {
            case "name" -> Comparator.comparing(User::name, String.CASE_INSENSITIVE_ORDER)
                    .thenComparing(User::id);
            case "id" -> Comparator.comparing(User::id);
            default -> Comparator.comparing(User::createdAt).thenComparing(User::id);
        };
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(user.id(), user.name(), user.createdAt());
    }
}
