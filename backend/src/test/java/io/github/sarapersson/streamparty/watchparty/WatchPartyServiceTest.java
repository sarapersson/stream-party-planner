package io.github.sarapersson.streamparty.watchparty;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class WatchPartyServiceTest {

	@Mock
	private WatchPartyRepository repository;

	@InjectMocks
	private WatchPartyService service;

	@Test
	void createBuildsPlannedWatchPartyAndPersistsIt() {
		WatchPartyCreateRequest request = new WatchPartyCreateRequest(
				"Friday movie night",
				"Bring popcorn",
				Instant.parse("2030-07-01T18:30:00Z"),
				"Comedy",
				6);

		ArgumentCaptor<WatchParty> captor = ArgumentCaptor.forClass(WatchParty.class);
		when(repository.save(captor.capture())).thenAnswer(invocation -> invocation.getArgument(0));

		WatchPartyResponse response = service.create(request);

		WatchParty saved = captor.getValue();
		assertThat(saved.getTitle()).isEqualTo("Friday movie night");
		assertThat(saved.getDescription()).isEqualTo("Bring popcorn");
		assertThat(saved.getScheduledAt()).isEqualTo(Instant.parse("2030-07-01T18:30:00Z"));
		assertThat(saved.getGenre()).isEqualTo("Comedy");
		assertThat(saved.getMaxParticipants()).isEqualTo(6);
		assertThat(saved.getStatus()).isEqualTo(WatchPartyStatus.PLANNED);

		assertThat(response.title()).isEqualTo("Friday movie night");
		assertThat(response.status()).isEqualTo(WatchPartyStatus.PLANNED);
	}

	@Test
	void findAllMapsEntitiesToResponses() {
		WatchParty watchParty = new WatchParty(
				"Sunday stream",
				"Documentary night",
				Instant.parse("2030-07-02T20:00:00Z"),
				"Documentary",
				10,
				WatchPartyStatus.PLANNED);

		when(repository.findAllByOrderByScheduledAtAsc()).thenReturn(List.of(watchParty));

		List<WatchPartyResponse> responses = service.findAll();

		assertThat(responses).hasSize(1);
		assertThat(responses.getFirst().title()).isEqualTo("Sunday stream");
		assertThat(responses.getFirst().genre()).isEqualTo("Documentary");
		verify(repository).findAllByOrderByScheduledAtAsc();
	}

	@Test
	void findByIdReturnsMappedResponseWhenWatchPartyExists() {
		UUID id = UUID.randomUUID();
		WatchParty watchParty = new WatchParty(
				"Watch with friends",
				null,
				Instant.parse("2030-07-03T19:00:00Z"),
				"Drama",
				4,
				WatchPartyStatus.PLANNED);

		when(repository.findById(id)).thenReturn(Optional.of(watchParty));

		WatchPartyResponse response = service.findById(id);

		assertThat(response.title()).isEqualTo("Watch with friends");
		assertThat(response.description()).isNull();
		assertThat(response.genre()).isEqualTo("Drama");
	}

	@Test
	void findByIdThrowsWhenWatchPartyIsMissing() {
		UUID id = UUID.randomUUID();
		when(repository.findById(id)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.findById(id))
			.isInstanceOf(WatchPartyNotFoundException.class)
			.hasMessageContaining(id.toString());
	}

	@Test
	void updateChangesExistingWatchParty() {
		UUID id = UUID.randomUUID();
		WatchParty watchParty = new WatchParty(
				"Original title",
				"Original description",
				Instant.parse("2030-07-04T18:00:00Z"),
				"Action",
				5,
				WatchPartyStatus.PLANNED);

		WatchPartyUpdateRequest request = new WatchPartyUpdateRequest(
				"Updated title",
				"Updated description",
				Instant.parse("2030-08-04T18:00:00Z"),
				"Sci-Fi",
				12,
				WatchPartyStatus.LIVE);

		when(repository.findById(id)).thenReturn(Optional.of(watchParty));

		WatchPartyResponse response = service.update(id, request);

		assertThat(response.title()).isEqualTo("Updated title");
		assertThat(response.description()).isEqualTo("Updated description");
		assertThat(response.scheduledAt()).isEqualTo(Instant.parse("2030-08-04T18:00:00Z"));
		assertThat(response.genre()).isEqualTo("Sci-Fi");
		assertThat(response.maxParticipants()).isEqualTo(12);
		assertThat(response.status()).isEqualTo(WatchPartyStatus.LIVE);
	}

	@Test
	void updateThrowsWhenWatchPartyIsMissing() {
		UUID id = UUID.randomUUID();
		WatchPartyUpdateRequest request = new WatchPartyUpdateRequest(
				"Updated title",
				"Updated description",
				Instant.parse("2030-08-04T18:00:00Z"),
				"Sci-Fi",
				12,
				WatchPartyStatus.LIVE);

		when(repository.findById(id)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.update(id, request))
			.isInstanceOf(WatchPartyNotFoundException.class)
			.hasMessageContaining(id.toString());
	}

	@Test
	void deleteRemovesExistingWatchParty() {
		UUID id = UUID.randomUUID();
		WatchParty watchParty = new WatchParty(
				"Delete me",
				null,
				Instant.parse("2030-07-05T18:00:00Z"),
				"Horror",
				3,
				WatchPartyStatus.PLANNED);

		when(repository.findById(id)).thenReturn(Optional.of(watchParty));

		service.delete(id);

		verify(repository).delete(watchParty);
	}

	@Test
	void deleteThrowsWhenWatchPartyIsMissing() {
		UUID id = UUID.randomUUID();
		when(repository.findById(id)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.delete(id))
			.isInstanceOf(WatchPartyNotFoundException.class)
			.hasMessageContaining(id.toString());
	}

}
