package com.meetup.beervote.vote;

import java.time.Instant;
import java.util.UUID;

public record Vote(UUID id, UUID userId, int beerId, Instant votedAt) {
}
