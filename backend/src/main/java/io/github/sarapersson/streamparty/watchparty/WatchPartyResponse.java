package io.github.sarapersson.streamparty.watchparty;

import java.time.Instant;
import java.util.UUID;

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
