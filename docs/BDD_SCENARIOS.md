# BDD Scenarios

This document describes the main user-facing behavior of StreamParty Planner using BDD-style scenarios.

The scenarios are written to describe expected behavior from a user perspective. They are not executed with Cucumber in the current baseline, but they are aligned with the implemented React UI, backend API and Playwright end-to-end tests.

## Feature: View Watch Parties

```gherkin
Feature: View watch parties

  Scenario: List existing watch parties
    Given the backend contains watch parties
    When the user opens StreamParty Planner
    Then the existing watch parties should be displayed in the list

  Scenario: Show an empty state when no watch parties exist
    Given there are no watch parties available
    When the user opens StreamParty Planner
    Then the user should see an empty state message instead of a watch party list
```

## Feature: Create Watch Parties

```gherkin
Feature: Create watch parties

  Scenario: Create a valid watch party
    Given the user is on the StreamParty Planner page
    When the user enters a valid title, description, date, genre and participant limit
    And submits the create form
    Then the new watch party should be created through the API
    And the new watch party should be visible in the list

  Scenario: Reject invalid create input
    Given the user is on the StreamParty Planner page
    When the user submits invalid or incomplete watch party details
    Then the application should show a user-facing error message
    And the invalid watch party should not be added to the list
```

## Feature: Update Watch Parties

```gherkin
Feature: Update watch parties

  Scenario: Edit an existing watch party
    Given a watch party exists
    When the user chooses to edit the watch party
    And saves valid updated details
    Then the watch party should be updated through the API
    And the updated values should be visible in the list

  Scenario: Cancel editing
    Given a watch party exists
    When the user starts editing the watch party
    And cancels the edit
    Then the original watch party details should remain unchanged
```

## Feature: Delete Watch Parties

```gherkin
Feature: Delete watch parties

  Scenario: Delete a watch party after confirmation
    Given a watch party exists
    When the user clicks delete
    And confirms the deletion
    Then the watch party should be deleted through the API
    And the watch party should no longer be visible in the list

  Scenario: Cancel deletion
    Given a watch party exists
    When the user clicks delete
    And cancels the confirmation dialog
    Then the watch party should still be visible in the list
```

## Feature: Error Handling

```gherkin
Feature: Error handling

  Scenario: Show an error when loading fails
    Given the backend API is unavailable or returns an error
    When the user opens StreamParty Planner
    Then the application should show a user-facing error message

  Scenario: Show an error when an API mutation fails
    Given the user is trying to create, update or delete a watch party
    When the backend API rejects the request or cannot be reached
    Then the application should show a user-facing error message
    And the UI should not pretend that the operation succeeded
```

## Relation to Automated Tests

These scenarios are represented by the automated test strategy:

| Behavior area                         | Automated verification               |
| ------------------------------------- | ------------------------------------ |
| Backend validation and business logic | JUnit and Spring Boot tests          |
| REST API contract                     | Postman/Newman API tests             |
| User-facing CRUD flows                | Playwright end-to-end tests          |
| Frontend build quality                | Vite production build and ESLint     |
| Dependency security                   | npm audit and OWASP Dependency-Check |
