package io.github.sarapersson.streamparty.watchparty;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import jakarta.persistence.EntityManager;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.testcontainers.postgresql.PostgreSQLContainer;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(WatchPartyRepositoryTest.TestcontainersConfiguration.class)
class WatchPartyRepositoryTest {

	@Autowired
	private WatchPartyRepository repository;

	@Autowired
	private EntityManager entityManager;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@Test
	void savesAndReadsBackWatchParty() {
		Instant scheduledAt = Instant.parse("2026-07-01T18:30:00Z");
		WatchParty watchParty = new WatchParty(
				"Saturday sci-fi stream",
				"Watching a classic together",
				scheduledAt,
				"Sci-Fi",
				8,
				WatchPartyStatus.PLANNED);

		WatchParty saved = repository.saveAndFlush(watchParty);
		UUID id = saved.getId();
		entityManager.clear();

		WatchParty found = repository.findById(id).orElseThrow();

		assertThat(found.getTitle()).isEqualTo("Saturday sci-fi stream");
		assertThat(found.getDescription()).isEqualTo("Watching a classic together");
		assertThat(found.getScheduledAt()).isEqualTo(scheduledAt);
		assertThat(found.getGenre()).isEqualTo("Sci-Fi");
		assertThat(found.getMaxParticipants()).isEqualTo(8);
		assertThat(found.getStatus()).isEqualTo(WatchPartyStatus.PLANNED);
		assertThat(found.getCreatedAt()).isNotNull();
		assertThat(found.getUpdatedAt()).isEqualTo(found.getCreatedAt());
	}

	@Test
	void persistsAndLoadsStatusAsString() {
		WatchParty watchParty = new WatchParty(
				"Live concert stream",
				null,
				Instant.parse("2026-07-02T20:00:00Z"),
				"Music",
				12,
				WatchPartyStatus.LIVE);

		WatchParty saved = repository.saveAndFlush(watchParty);
		entityManager.clear();

		WatchParty found = repository.findById(saved.getId()).orElseThrow();
		String storedStatus = jdbcTemplate.queryForObject(
				"select status from watch_parties where id = ?",
				String.class,
				saved.getId());

		assertThat(found.getStatus()).isEqualTo(WatchPartyStatus.LIVE);
		assertThat(storedStatus).isEqualTo("LIVE");
	}

	@Test
	void findAllByOrderByScheduledAtAscReturnsWatchPartiesChronologically() {
		WatchParty laterWatchParty = new WatchParty(
				"Later stream",
				"Scheduled later",
				Instant.parse("2030-07-02T20:00:00Z"),
				"Sci-Fi",
				8,
				WatchPartyStatus.PLANNED);
		WatchParty earlierWatchParty = new WatchParty(
				"Earlier stream",
				"Scheduled earlier",
				Instant.parse("2030-07-01T18:00:00Z"),
				"Drama",
				6,
				WatchPartyStatus.PLANNED);

		repository.saveAllAndFlush(List.of(laterWatchParty, earlierWatchParty));
		entityManager.clear();

		List<WatchParty> watchParties = repository.findAllByOrderByScheduledAtAsc();

		assertThat(watchParties).hasSize(2);
		assertThat(watchParties.get(0).getTitle()).isEqualTo("Earlier stream");
		assertThat(watchParties.get(1).getTitle()).isEqualTo("Later stream");
	}

	@Test
	void rejectsNonPositiveMaxParticipants() {
		assertThatThrownBy(() -> jdbcTemplate.update("""
				insert into watch_parties
					(id, title, scheduled_at, genre, max_participants, status, created_at, updated_at)
				values
					(?, ?, now(), ?, ?, ?, now(), now())
				""",
				UUID.randomUUID(),
				"Constraint check stream",
				"Drama",
				0,
				"PLANNED"))
			.isInstanceOf(DataIntegrityViolationException.class);
	}

	@TestConfiguration(proxyBeanMethods = false)
	static class TestcontainersConfiguration {

		@Bean
		@ServiceConnection
		PostgreSQLContainer postgresContainer() {
			return new PostgreSQLContainer("postgres:18.4");
		}

	}

}
