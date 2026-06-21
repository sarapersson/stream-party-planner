package io.github.sarapersson.streamparty.watchparty;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/watch-parties")
public class WatchPartyController {

	private final WatchPartyService service;

	public WatchPartyController(WatchPartyService service) {
		this.service = service;
	}

	@PostMapping
	public ResponseEntity<WatchPartyResponse> create(@Valid @RequestBody WatchPartyCreateRequest request) {
		WatchPartyResponse response = service.create(request);
		URI location = ServletUriComponentsBuilder.fromCurrentRequest()
			.path("/{id}")
			.buildAndExpand(response.id())
			.toUri();

		return ResponseEntity.created(location).body(response);
	}

	@GetMapping
	public ResponseEntity<List<WatchPartyResponse>> findAll() {
		return ResponseEntity.ok(service.findAll());
	}

	@GetMapping("/{id}")
	public ResponseEntity<WatchPartyResponse> findById(@PathVariable UUID id) {
		return ResponseEntity.ok(service.findById(id));
	}

}
