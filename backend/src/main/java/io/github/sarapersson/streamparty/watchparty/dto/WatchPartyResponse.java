package io.github.sarapersson.streamparty.watchparty.dto;

import java.time.Instant;
import java.util.UUID;

import io.github.sarapersson.streamparty.watchparty.WatchPartyStatus;

public record WatchPartyResponse(
		UUID id,
		String title,
		String description,
		Instant scheduledAt,
		String genre,
		int maxParticipants,
		WatchPartyStatus status,
		Instant createdAt,
		Instant updatedAt) {
}
