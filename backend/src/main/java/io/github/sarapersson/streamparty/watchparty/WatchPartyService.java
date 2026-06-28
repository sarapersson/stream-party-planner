package io.github.sarapersson.streamparty.watchparty;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WatchPartyService {

	private final WatchPartyRepository repository;

	public WatchPartyService(WatchPartyRepository repository) {
		this.repository = repository;
	}

	@Transactional
	public WatchPartyResponse create(WatchPartyCreateRequest request) {
		WatchParty watchParty = new WatchParty(
				request.title(),
				request.description(),
				request.scheduledAt(),
				request.genre(),
				request.maxParticipants(),
				WatchPartyStatus.PLANNED);

		WatchParty saved = repository.save(watchParty);
		return WatchPartyMapper.toResponse(saved);
	}

	@Transactional(readOnly = true)
	public List<WatchPartyResponse> findAll() {
		return repository.findAllByOrderByScheduledAtAsc()
			.stream()
			.map(WatchPartyMapper::toResponse)
			.toList();
	}

	@Transactional(readOnly = true)
	public WatchPartyResponse findById(UUID id) {
		WatchParty watchParty = repository.findById(id)
			.orElseThrow(() -> new WatchPartyNotFoundException(id));

		return WatchPartyMapper.toResponse(watchParty);
	}

	@Transactional
	public WatchPartyResponse update(UUID id, WatchPartyUpdateRequest request) {
		WatchParty watchParty = repository.findById(id)
			.orElseThrow(() -> new WatchPartyNotFoundException(id));

		watchParty.updateDetails(
				request.title(),
				request.description(),
				request.scheduledAt(),
				request.genre(),
				request.maxParticipants(),
				request.status());

		return WatchPartyMapper.toResponse(watchParty);
	}

	@Transactional
	public void delete(UUID id) {
		WatchParty watchParty = repository.findById(id)
			.orElseThrow(() -> new WatchPartyNotFoundException(id));

		repository.delete(watchParty);
	}

}
