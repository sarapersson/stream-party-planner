package io.github.sarapersson.streamparty.watchparty;

final class WatchPartyMapper {

	private WatchPartyMapper() {
	}

	static WatchPartyResponse toResponse(WatchParty watchParty) {
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
