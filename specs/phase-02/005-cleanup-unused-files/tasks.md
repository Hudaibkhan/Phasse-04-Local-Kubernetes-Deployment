---
description: "Task list for cleaning up unused and test files in the codebase"
---

# Tasks: Cleanup Unused & Test Files

**Input**: Design documents from `/specs/005-cleanup-unused-files/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare for safe cleanup process

- [X] T001 Identify and catalog all files in frontend/ directory
- [X] T002 Identify and catalog all files in backend/ directory
- [X] T003 [P] Install file analysis tools (ripgrep, find, etc.)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core analysis infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create comprehensive list of all file references in the codebase
- [X] T005 [P] Analyze import/usage patterns for JavaScript/TypeScript files
- [X] T006 [P] Analyze import/usage patterns for Python files
- [X] T007 Create backup of current codebase before any deletions
- [X] T008 [P] Document current application functionality for verification
- [X] T009 Run full test suite to establish baseline

**Checkpoint**: Analysis ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Developer Maintains Clean Codebase (Priority: P1) 🎯 MVP

**Goal**: Remove unused or test-only files while ensuring all functionality remains intact

**Independent Test**: The codebase contains only files that are actively used by the application, with no orphaned or test-only files remaining.

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T010 [P] [US1] Create verification script to check for broken imports after cleanup
- [X] T011 [P] [US1] Create verification script to test core functionality after each deletion

### Implementation for User Story 1

- [X] T012 [P] [US1] Identify and remove unused test files in frontend/ directory
- [X] T013 [P] [US1] Identify and remove unused test files in backend/ directory
- [X] T014 [US1] Identify and remove temporary/debug files in frontend/ directory
- [X] T015 [US1] Identify and remove temporary/debug files in backend/ directory
- [X] T016 [US1] Remove one unused file and verify application still works
- [X] T017 [US1] Run application verification after each deletion
- [X] T018 [US1] Document each file removal with reason for deletion

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Reduced Build Times and Improved Performance (Priority: P2)

**Goal**: Reduce the number of unnecessary files in the project to improve build times and performance

**Independent Test**: Build times and project size are reduced after cleanup while functionality remains unchanged.

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [X] T019 [P] [US2] Measure and document current project size before cleanup
- [X] T020 [P] [US2] Measure and document current build times before cleanup

### Implementation for User Story 2

- [X] T021 [P] [US2] Remove unused asset files (images, icons, etc.) from frontend/
- [X] T022 [P] [US2] Remove duplicate or redundant components in frontend/
- [X] T023 [US2] Remove unused utility files in frontend/ and backend/
- [X] T024 [US2] Remove sample or template files not in use
- [X] T025 [US2] Re-measure project size after cleanup
- [X] T026 [US2] Re-measure build times after cleanup

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Enhanced Code Navigation (Priority: P3)

**Goal**: Streamline the codebase to improve navigation and reduce cognitive load

**Independent Test**: The number of irrelevant files that appear during navigation decreases after cleanup.

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [X] T027 [P] [US3] Document current file count in key directories before cleanup

### Implementation for User Story 3

- [X] T028 [P] [US3] Remove unused CSS/SCSS files from frontend/
- [X] T029 [P] [US3] Remove unused configuration files not in use
- [X] T030 [US3] Organize remaining files for better navigation
- [X] T031 [US3] Update documentation to reflect new cleaner structure
- [X] T032 [US3] Re-count files in key directories after cleanup

**Checkpoint**: All user stories should now be independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T033 [P] Update gitignore to exclude any new temporary files
- [X] T034 Verify all core features (auth, tasks) still work after cleanup
- [X] T035 Run full test suite to ensure no regressions
- [X] T036 [P] Update documentation reflecting the cleaner codebase
- [X] T037 [P] Create final report of files removed and benefits achieved
- [X] T038 Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Analysis before identification
- Identification before removal
- Removal with verification after each file deletion
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Sequential Safe Cleanup Strategy

With the cleanup feature:
1. Complete Setup + Foundational → Analysis ready
2. Complete User Story 1 → Remove test/unused files → Verify functionality
3. Complete User Story 2 → Remove assets/utils → Verify performance improvement
4. Complete User Story 3 → Organize structure → Verify navigation improvement
5. Each phase maintains functionality while improving the codebase

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- For cleanup tasks: verify functionality after each deletion
- Avoid: removing files that are dynamically referenced or environment-specific