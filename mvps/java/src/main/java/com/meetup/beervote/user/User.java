package com.meetup.beervote.user;

import java.time.Instant;
import java.util.UUID;

public record User(UUID id, String name, Instant createdAt) {
}
