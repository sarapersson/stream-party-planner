package io.github.sarapersson.streamparty.watchparty.dto;

import java.time.Instant;

import io.github.sarapersson.streamparty.watchparty.WatchPartyStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record WatchPartyUpdateRequest(
		@NotBlank
		@Size(max = 120)
		String title,

		@Size(max = 1000)
		String description,

		@NotNull
		Instant scheduledAt,

		@NotBlank
		@Size(max = 80)
		String genre,

		@Positive
		int maxParticipants,

		@NotNull
		WatchPartyStatus status) {
}
