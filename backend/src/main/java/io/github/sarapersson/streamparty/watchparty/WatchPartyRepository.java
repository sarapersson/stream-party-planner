package io.github.sarapersson.streamparty.watchparty;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface WatchPartyRepository extends JpaRepository<WatchParty, UUID> {
}
