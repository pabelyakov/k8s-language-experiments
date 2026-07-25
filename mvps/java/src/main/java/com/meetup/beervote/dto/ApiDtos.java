package com.meetup.beervote.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class ApiDtos {

    private ApiDtos() {
    }

    public record HealthResponse(String status, String service, String runtime) {
    }

    public record BeerItem(int id, String name) {
    }

    public record BeerListResponse(List<BeerItem> items) {
    }

    public record CreateUserRequest(String name) {
    }

    public record UserResponse(UUID id, String name, Instant createdAt) {
    }

    public record UserListResponse(
            List<UserResponse> items,
            int page,
            int pageSize,
            long total,
            int totalPages
    ) {
    }

    public record CreateVoteRequest(UUID userId, int beerId) {
    }

    public record VoteResponse(
            UUID id,
            UUID userId,
            int beerId,
            String beerName,
            Instant votedAt
    ) {
    }

    public record ResultItem(int beerId, String beerName, long votes, BigDecimal share) {
    }

    public record ResultsResponse(long totalVotes, List<ResultItem> results) {
    }

    public record ErrorResponse(String error, int status) {
    }
}
