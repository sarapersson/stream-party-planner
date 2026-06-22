package io.github.sarapersson.streamparty.watchparty;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

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
import org.springframework.test.util.ReflectionTestUtils;

import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class WatchPartyServiceTest {

	@Mock
	private WatchPartyRepository repository;

	@InjectMocks
	private WatchPartyService service;

	@Test
	void createDefaultsStatusToPlannedAndSavesThroughRepository() {
		WatchPartyCreateRequest request = new WatchPartyCreateRequest(
				"Saturday sci-fi stream",
				"Watching a classic together",
				Instant.parse("2030-07-01T18:30:00Z"),
				"Sci-Fi",
				8);
		given(repository.save(any(WatchParty.class))).willAnswer(invocation -> invocation.getArgument(0));

		WatchPartyResponse response = service.create(request);

		ArgumentCaptor<WatchParty> watchPartyCaptor = ArgumentCaptor.forClass(WatchParty.class);
		verify(repository).save(watchPartyCaptor.capture());
		WatchParty saved = watchPartyCaptor.getValue();

		assertThat(saved.getTitle()).isEqualTo("Saturday sci-fi stream");
		assertThat(saved.getDescription()).isEqualTo("Watching a classic together");
		assertThat(saved.getScheduledAt()).isEqualTo(Instant.parse("2030-07-01T18:30:00Z"));
		assertThat(saved.getGenre()).isEqualTo("Sci-Fi");
		assertThat(saved.getMaxParticipants()).isEqualTo(8);
		assertThat(saved.getStatus()).isEqualTo(WatchPartyStatus.PLANNED);
		assertThat(response.status()).isEqualTo(WatchPartyStatus.PLANNED);
	}

	@Test
	void findByIdThrowsWatchPartyNotFoundExceptionWhenMissing() {
		UUID id = UUID.randomUUID();
		given(repository.findById(id)).willReturn(Optional.empty());

		assertThatThrownBy(() -> service.findById(id))
			.isInstanceOf(WatchPartyNotFoundException.class)
			.hasMessageContaining(id.toString());
	}

	@Test
	void findAllMapsEntitiesToResponses() {
		UUID id = UUID.randomUUID();
		WatchParty watchParty = new WatchParty(
				"Saturday sci-fi stream",
				"Watching a classic together",
				Instant.parse("2030-07-01T18:30:00Z"),
				"Sci-Fi",
				8,
				WatchPartyStatus.PLANNED);
		ReflectionTestUtils.setField(watchParty, "id", id);
		given(repository.findAll()).willReturn(List.of(watchParty));

		List<WatchPartyResponse> responses = service.findAll();

		assertThat(responses).singleElement()
			.satisfies(response -> {
				assertThat(response.id()).isEqualTo(id);
				assertThat(response.title()).isEqualTo("Saturday sci-fi stream");
				assertThat(response.description()).isEqualTo("Watching a classic together");
				assertThat(response.scheduledAt()).isEqualTo(Instant.parse("2030-07-01T18:30:00Z"));
				assertThat(response.genre()).isEqualTo("Sci-Fi");
				assertThat(response.maxParticipants()).isEqualTo(8);
				assertThat(response.status()).isEqualTo(WatchPartyStatus.PLANNED);
				assertThat(response.createdAt()).isEqualTo(watchParty.getCreatedAt());
				assertThat(response.updatedAt()).isEqualTo(watchParty.getUpdatedAt());
			});
	}

	@Test
	void updateExistingWatchPartyUpdatesMutableFieldsAndReturnsResponse() {
		UUID id = UUID.randomUUID();
		Instant createdAt = Instant.parse("2026-06-21T10:15:30Z");
		Instant previousUpdatedAt = Instant.parse("2026-06-21T10:15:30Z");
		Instant scheduledAt = Instant.parse("2030-08-01T20:00:00Z");
		WatchParty watchParty = new WatchParty(
				"Saturday sci-fi stream",
				"Watching a classic together",
				Instant.parse("2030-07-01T18:30:00Z"),
				"Sci-Fi",
				8,
				WatchPartyStatus.PLANNED);
		ReflectionTestUtils.setField(watchParty, "id", id);
		ReflectionTestUtils.setField(watchParty, "createdAt", createdAt);
		ReflectionTestUtils.setField(watchParty, "updatedAt", previousUpdatedAt);
		WatchPartyUpdateRequest request = new WatchPartyUpdateRequest(
				"Updated stream",
				"Updated description",
				scheduledAt,
				"Drama",
				12,
				WatchPartyStatus.CANCELLED);
		given(repository.findById(id)).willReturn(Optional.of(watchParty));

		WatchPartyResponse response = service.update(id, request);

		assertThat(watchParty.getTitle()).isEqualTo("Updated stream");
		assertThat(watchParty.getDescription()).isEqualTo("Updated description");
		assertThat(watchParty.getScheduledAt()).isEqualTo(scheduledAt);
		assertThat(watchParty.getGenre()).isEqualTo("Drama");
		assertThat(watchParty.getMaxParticipants()).isEqualTo(12);
		assertThat(watchParty.getStatus()).isEqualTo(WatchPartyStatus.CANCELLED);
		assertThat(watchParty.getCreatedAt()).isEqualTo(createdAt);
		assertThat(watchParty.getUpdatedAt()).isAfter(previousUpdatedAt);
		assertThat(response.id()).isEqualTo(id);
		assertThat(response.title()).isEqualTo("Updated stream");
		assertThat(response.description()).isEqualTo("Updated description");
		assertThat(response.scheduledAt()).isEqualTo(scheduledAt);
		assertThat(response.genre()).isEqualTo("Drama");
		assertThat(response.maxParticipants()).isEqualTo(12);
		assertThat(response.status()).isEqualTo(WatchPartyStatus.CANCELLED);
		assertThat(response.createdAt()).isEqualTo(createdAt);
		assertThat(response.updatedAt()).isEqualTo(watchParty.getUpdatedAt());
	}

	@Test
	void updateMissingWatchPartyThrowsWatchPartyNotFoundException() {
		UUID id = UUID.randomUUID();
		WatchPartyUpdateRequest request = new WatchPartyUpdateRequest(
				"Updated stream",
				"Updated description",
				Instant.parse("2030-08-01T20:00:00Z"),
				"Drama",
				12,
				WatchPartyStatus.CANCELLED);
		given(repository.findById(id)).willReturn(Optional.empty());

		assertThatThrownBy(() -> service.update(id, request))
			.isInstanceOf(WatchPartyNotFoundException.class)
			.hasMessageContaining(id.toString());
	}

	@Test
	void deleteExistingWatchPartyDeletesThroughRepository() {
		UUID id = UUID.randomUUID();
		WatchParty watchParty = new WatchParty(
				"Saturday sci-fi stream",
				"Watching a classic together",
				Instant.parse("2030-07-01T18:30:00Z"),
				"Sci-Fi",
				8,
				WatchPartyStatus.PLANNED);
		given(repository.findById(id)).willReturn(Optional.of(watchParty));

		service.delete(id);

		verify(repository).delete(watchParty);
	}

	@Test
	void deleteMissingWatchPartyThrowsWatchPartyNotFoundException() {
		UUID id = UUID.randomUUID();
		given(repository.findById(id)).willReturn(Optional.empty());

		assertThatThrownBy(() -> service.delete(id))
			.isInstanceOf(WatchPartyNotFoundException.class)
			.hasMessageContaining(id.toString());
		verify(repository, never()).delete(any(WatchParty.class));
	}

}
