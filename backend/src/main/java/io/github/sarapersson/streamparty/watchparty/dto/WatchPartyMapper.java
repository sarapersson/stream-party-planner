package io.github.sarapersson.streamparty.watchparty.dto;

import io.github.sarapersson.streamparty.watchparty.WatchParty;

public final class WatchPartyMapper {

	private WatchPartyMapper() {
	}

	public static WatchPartyResponse toResponse(WatchParty watchParty) {
		return new WatchPartyResponse(
				watchParty.getId(),
				watchParty.getTitle(),
				watchParty.getDescription(),
				watchParty.getScheduledAt(),
				watchParty.getGenre(),
				watchParty.getMaxParticipants(),
				watchParty.getStatus(),
				watchParty.getCreatedAt(),
				watchParty.getUpdatedAt());
	}

}
