package io.github.sarapersson.streamparty.watchparty;

import static org.hamcrest.Matchers.endsWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.BDDMockito.given;

@WebMvcTest(WatchPartyController.class)
@Import(ApiExceptionHandler.class)
class WatchPartyControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private WatchPartyService service;

	@Test
	void createWatchPartyReturnsCreatedResponse() throws Exception {
		UUID id = UUID.randomUUID();
		Instant scheduledAt = Instant.now().plus(Duration.ofDays(1)).truncatedTo(ChronoUnit.SECONDS);
		Instant createdAt = Instant.parse("2026-06-21T10:15:30Z");
		WatchPartyCreateRequest request = new WatchPartyCreateRequest(
				"Saturday sci-fi stream",
				"Watching a classic together",
				scheduledAt,
				"Sci-Fi",
				8);
		WatchPartyResponse response = new WatchPartyResponse(
				id,
				request.title(),
				request.description(),
				request.scheduledAt(),
				request.genre(),
				request.maxParticipants(),
				WatchPartyStatus.PLANNED,
				createdAt,
				createdAt);
		given(service.create(any(WatchPartyCreateRequest.class))).willReturn(response);
		String requestBody = """
				{
				  "title": "Saturday sci-fi stream",
				  "description": "Watching a classic together",
				  "scheduledAt": "%s",
				  "genre": "Sci-Fi",
				  "maxParticipants": 8
				}
				""".formatted(scheduledAt);

		mockMvc.perform(post("/api/watch-parties")
				.contentType(MediaType.APPLICATION_JSON)
				.content(requestBody))
			.andExpect(status().isCreated())
			.andExpect(header().string("Location", endsWith("/api/watch-parties/" + id)))
			.andExpect(jsonPath("$.id").value(id.toString()))
			.andExpect(jsonPath("$.title").value("Saturday sci-fi stream"))
			.andExpect(jsonPath("$.description").value("Watching a classic together"))
			.andExpect(jsonPath("$.scheduledAt").value(scheduledAt.toString()))
			.andExpect(jsonPath("$.genre").value("Sci-Fi"))
			.andExpect(jsonPath("$.maxParticipants").value(8))
			.andExpect(jsonPath("$.status").value("PLANNED"))
			.andExpect(jsonPath("$.createdAt").value(createdAt.toString()))
			.andExpect(jsonPath("$.updatedAt").value(createdAt.toString()));
	}

	@Test
	void createWatchPartyWithInvalidRequestReturnsProblemDetail() throws Exception {
		String requestBody = """
				{
				  "title": "",
				  "description": "Watching a classic together",
				  "scheduledAt": "2020-01-01T00:00:00Z",
				  "genre": "",
				  "maxParticipants": 0
				}
				""";

		mockMvc.perform(post("/api/watch-parties")
				.contentType(MediaType.APPLICATION_JSON)
				.content(requestBody))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.title").value("Validation failed"))
			.andExpect(jsonPath("$.status").value(400))
			.andExpect(jsonPath("$.fieldErrors").isArray());

		verifyNoInteractions(service);
	}

	@Test
	void findAllWatchPartiesReturnsArray() throws Exception {
		UUID id = UUID.randomUUID();
		Instant scheduledAt = Instant.parse("2030-07-01T18:30:00Z");
		Instant createdAt = Instant.parse("2026-06-21T10:15:30Z");
		WatchPartyResponse response = new WatchPartyResponse(
				id,
				"Saturday sci-fi stream",
				"Watching a classic together",
				scheduledAt,
				"Sci-Fi",
				8,
				WatchPartyStatus.PLANNED,
				createdAt,
				createdAt);
		given(service.findAll()).willReturn(List.of(response));

		mockMvc.perform(get("/api/watch-parties"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$").isArray())
			.andExpect(jsonPath("$[0].id").value(id.toString()))
			.andExpect(jsonPath("$[0].title").value("Saturday sci-fi stream"))
			.andExpect(jsonPath("$[0].description").value("Watching a classic together"))
			.andExpect(jsonPath("$[0].scheduledAt").value(scheduledAt.toString()))
			.andExpect(jsonPath("$[0].genre").value("Sci-Fi"))
			.andExpect(jsonPath("$[0].maxParticipants").value(8))
			.andExpect(jsonPath("$[0].status").value("PLANNED"));
	}

	@Test
	void findWatchPartyByIdWhenFoundReturnsResponse() throws Exception {
		UUID id = UUID.randomUUID();
		Instant scheduledAt = Instant.parse("2030-07-01T18:30:00Z");
		Instant createdAt = Instant.parse("2026-06-21T10:15:30Z");
		WatchPartyResponse response = new WatchPartyResponse(
				id,
				"Saturday sci-fi stream",
				"Watching a classic together",
				scheduledAt,
				"Sci-Fi",
				8,
				WatchPartyStatus.PLANNED,
				createdAt,
				createdAt);
		given(service.findById(id)).willReturn(response);

		mockMvc.perform(get("/api/watch-parties/{id}", id))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.id").value(id.toString()))
			.andExpect(jsonPath("$.title").value("Saturday sci-fi stream"))
			.andExpect(jsonPath("$.description").value("Watching a classic together"))
			.andExpect(jsonPath("$.scheduledAt").value(scheduledAt.toString()))
			.andExpect(jsonPath("$.genre").value("Sci-Fi"))
			.andExpect(jsonPath("$.maxParticipants").value(8))
			.andExpect(jsonPath("$.status").value("PLANNED"));
	}

	@Test
	void findWatchPartyByIdWhenMissingReturnsProblemDetail() throws Exception {
		UUID id = UUID.randomUUID();
		given(service.findById(id)).willThrow(new WatchPartyNotFoundException(id));

		mockMvc.perform(get("/api/watch-parties/{id}", id))
			.andExpect(status().isNotFound())
			.andExpect(jsonPath("$.title").value("Watch party not found"))
			.andExpect(jsonPath("$.status").value(404))
			.andExpect(jsonPath("$.detail").value("No watch party exists with id " + id + "."));
	}

}
