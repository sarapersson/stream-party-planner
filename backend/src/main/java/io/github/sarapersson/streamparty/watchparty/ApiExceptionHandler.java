package io.github.sarapersson.streamparty.watchparty;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
class ApiExceptionHandler {

	@ExceptionHandler(WatchPartyNotFoundException.class)
	ResponseEntity<ProblemDetail> handleWatchPartyNotFound(WatchPartyNotFoundException exception) {
		ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.NOT_FOUND);
		problem.setTitle("Watch party not found");
		problem.setDetail("No watch party exists with id " + exception.getId() + ".");

		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problem);
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	ResponseEntity<ProblemDetail> handleValidationError(MethodArgumentNotValidException exception) {
		ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
		problem.setTitle("Validation failed");
		problem.setDetail("Request validation failed. Check fieldErrors for details.");
		problem.setProperty("fieldErrors", fieldErrors(exception));

		return ResponseEntity.badRequest().body(problem);
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	ResponseEntity<ProblemDetail> handleUnreadableMessage(HttpMessageNotReadableException exception) {
		ProblemDetail problem = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
		problem.setTitle("Malformed request");
		problem.setDetail("Request body is invalid or unreadable.");

		return ResponseEntity.badRequest().body(problem);
	}

	private static List<FieldValidationError> fieldErrors(MethodArgumentNotValidException exception) {
		return exception.getBindingResult()
			.getFieldErrors()
			.stream()
			.map(fieldError -> new FieldValidationError(fieldError.getField(), fieldError.getDefaultMessage()))
			.toList();
	}

	private record FieldValidationError(String field, String message) {
	}

}
