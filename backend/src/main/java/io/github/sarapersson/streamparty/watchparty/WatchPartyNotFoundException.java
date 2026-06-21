package io.github.sarapersson.streamparty.watchparty;

import java.util.UUID;

public class WatchPartyNotFoundException extends RuntimeException {

	private final UUID id;

	public WatchPartyNotFoundException(UUID id) {
		super("Watch party not found: " + id);
		this.id = id;
	}

	public UUID getId() {
		return id;
	}

}
