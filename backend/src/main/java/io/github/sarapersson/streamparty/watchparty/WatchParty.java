package io.github.sarapersson.streamparty.watchparty;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "watch_parties")
public class WatchParty {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;

	@Column(nullable = false, length = 120)
	private String title;

	@Column(length = 1000)
	private String description;

	@Column(name = "scheduled_at", nullable = false)
	private Instant scheduledAt;

	@Column(nullable = false, length = 80)
	private String genre;

	@Column(name = "max_participants", nullable = false)
	private int maxParticipants;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 20)
	private WatchPartyStatus status;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	protected WatchParty() {
	}

	public WatchParty(
			String title,
			String description,
			Instant scheduledAt,
			String genre,
			int maxParticipants,
			WatchPartyStatus status) {
		this.title = requireText(title, "title", 120);
		this.description = requireMaxLength(description, "description", 1000);
		this.scheduledAt = Objects.requireNonNull(scheduledAt, "scheduledAt must not be null");
		this.genre = requireText(genre, "genre", 80);
		this.maxParticipants = requirePositive(maxParticipants);
		this.status = Objects.requireNonNull(status, "status must not be null");

		Instant now = Instant.now();
		this.createdAt = now;
		this.updatedAt = now;
	}

	public UUID getId() {
		return id;
	}

	public String getTitle() {
		return title;
	}

	public String getDescription() {
		return description;
	}

	public Instant getScheduledAt() {
		return scheduledAt;
	}

	public String getGenre() {
		return genre;
	}

	public int getMaxParticipants() {
		return maxParticipants;
	}

	public WatchPartyStatus getStatus() {
		return status;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}

	private static String requireText(String value, String fieldName, int maxLength) {
		if (value == null || value.isBlank()) {
			throw new IllegalArgumentException(fieldName + " must not be blank");
		}
		return requireMaxLength(value, fieldName, maxLength);
	}

	private static String requireMaxLength(String value, String fieldName, int maxLength) {
		if (value != null && value.length() > maxLength) {
			throw new IllegalArgumentException(fieldName + " must be at most " + maxLength + " characters");
		}
		return value;
	}

	private static int requirePositive(int value) {
		if (value <= 0) {
			throw new IllegalArgumentException("maxParticipants must be greater than 0");
		}
		return value;
	}

}
