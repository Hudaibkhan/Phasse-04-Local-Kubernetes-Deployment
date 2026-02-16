# Tasks: Frontend Chatbot UI Integration

**Input**: Design documents from `/specs/006-chatbot-ui/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/component-api.md, quickstart.md

**Tests**: Not explicitly requested in specification - focus on implementation and manual validation

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

All paths relative to `frontend/` directory.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, directory structure, and type definitions

- [x] T001 Create chat components directory at frontend/src/components/chat/
- [x] T002 Create chat hooks directory at frontend/src/hooks/ (if not exists)
- [x] T003 Create chat services directory at frontend/src/services/ (if not exists)
- [x] T004 Create chat types file at frontend/src/types/chat.ts with Message, ChatState, ChatAction, ChatRequest, ChatResponse interfaces
- [x] T005 Verify Next.js 15+, React 18+, and Tailwind CSS 3.x are installed in frontend/package.json

**Checkpoint**: ✅ Directory structure created, type definitions in place, dependencies verified

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 [P] Create chatService.ts at frontend/src/services/chatService.ts with sendMessage function and error handling
- [x] T007 [P] Create chatReducer.ts at frontend/src/hooks/chatReducer.ts with initialChatState and chatReducer function
- [x] T008 Create useChat.ts hook at frontend/src/hooks/useChat.ts with state management, openModal, closeModal, sendMessage, clearError functions

**Checkpoint**: ✅ Foundation ready - API service, reducer, and custom hook implemented

---

## Phase 3: User Story 1 - Basic Chat Interaction (Priority: P1) 🎯 MVP

**Goal**: Users can access a chatbot interface to send natural language commands and receive conversational responses

**Independent Test**: User clicks the chat button, types "Add a task to buy groceries", sends the message, and receives a confirmation response from the assistant. The task is created in the backend.

### Implementation for User Story 1

- [ ] T009 [P] [US1] Create ChatButton.tsx component at frontend/src/components/chat/ChatButton.tsx with floating button styling and onClick handler
- [ ] T010 [P] [US1] Create ChatMessage.tsx component at frontend/src/components/chat/ChatMessage.tsx with user/assistant message bubbles and error state
- [ ] T011 [P] [US1] Create ChatLoading.tsx component at frontend/src/components/chat/ChatLoading.tsx with animated loading indicator
- [ ] T012 [US1] Create ChatMessages.tsx component at frontend/src/components/chat/ChatMessages.tsx with message list, auto-scroll, and empty state
- [ ] T013 [US1] Create ChatInput.tsx component at frontend/src/components/chat/ChatInput.tsx with input field, send button, and validation
- [ ] T014 [US1] Create ChatModal.tsx component at frontend/src/components/chat/ChatModal.tsx with portal rendering, overlay, and close functionality
- [ ] T015 [US1] Create ChatWidget.tsx component at frontend/src/components/chat/ChatWidget.tsx integrating all chat components with useChat hook
- [ ] T016 [US1] Integrate ChatWidget into dashboard layout at frontend/src/app/dashboard/layout.tsx
- [ ] T017 [US1] Test complete message flow: open modal → send message → receive response → close modal
- [ ] T018 [US1] Verify backend integration with POST /api/chat endpoint using JWT authentication
- [ ] T019 [US1] Test error handling for network failures and API errors
- [ ] T020 [US1] Verify floating button is visible on all dashboard pages

**Checkpoint**: User Story 1 complete - basic chat interaction functional with all core components

---

## Phase 4: User Story 2 - Conversation Continuity (Priority: P2)

**Goal**: Users can see full conversation history within a single session and maintain context across multiple messages

**Independent Test**: User sends multiple messages in sequence ("Add task A", "Show my tasks", "Delete task A") and can scroll up to see all previous messages in the conversation.

### Implementation for User Story 2

- [ ] T021 [US2] Implement auto-scroll functionality in ChatMessages.tsx using useRef and useEffect to scroll to latest message
- [ ] T022 [US2] Add scroll container with overflow-auto to ChatMessages.tsx for scrollable message history
- [ ] T023 [US2] Verify conversation history persists when modal is closed and reopened within same session
- [ ] T024 [US2] Test with 10+ messages to ensure scrolling works correctly and performance is acceptable
- [ ] T025 [US2] Verify messages remain in chronological order after multiple send/receive cycles
- [ ] T026 [US2] Test that closing modal does not clear conversation history (session-based persistence)

**Checkpoint**: User Story 2 complete - conversation continuity with scrollable history

---

## Phase 5: User Story 3 - Responsive and Accessible UI (Priority: P3)

**Goal**: Users can access the chatbot on any device with an interface that adapts to screen size and matches the application's visual design

**Independent Test**: User opens the chatbot on a mobile device (viewport width <768px) and the modal adjusts to fit the screen with appropriate sizing and spacing.

### Implementation for User Story 3

- [ ] T027 [P] [US3] Add responsive styles to ChatModal.tsx for mobile (<768px), tablet (768-1024px), and desktop (>1024px) breakpoints
- [ ] T028 [P] [US3] Add responsive styles to ChatButton.tsx to ensure visibility and accessibility on all screen sizes
- [ ] T029 [P] [US3] Add responsive styles to ChatInput.tsx for textarea expansion and button sizing on mobile
- [ ] T030 [US3] Add ARIA attributes to ChatModal.tsx (role="dialog", aria-modal="true", aria-labelledby)
- [ ] T031 [US3] Implement keyboard navigation: Escape key closes modal, Enter sends message, Tab cycles through elements
- [ ] T032 [US3] Implement focus management: auto-focus input when modal opens, restore focus to button when modal closes
- [ ] T033 [US3] Add focus trap to ChatModal.tsx to prevent focus from leaving modal when open
- [ ] T034 [US3] Verify theme consistency: colors, fonts, and gradients match existing dashboard theme
- [ ] T035 [US3] Test on mobile device (or browser DevTools mobile emulation) with viewport <768px
- [ ] T036 [US3] Test on tablet device (or browser DevTools) with viewport 768-1024px
- [ ] T037 [US3] Test on desktop with viewport >1024px
- [ ] T038 [US3] Test keyboard-only navigation (no mouse) through entire chat flow

**Checkpoint**: User Story 3 complete - responsive design and accessibility features implemented

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, error handling enhancements, and production readiness

- [ ] T039 [P] Add character count display to ChatInput.tsx showing current length and warning when approaching 2000 character limit
- [ ] T040 [P] Create ChatError.tsx component at frontend/src/components/chat/ChatError.tsx for displaying error messages with retry option
- [ ] T041 [P] Add error boundary to ChatWidget.tsx to catch and handle React errors gracefully
- [ ] T042 Implement message validation in useChat.ts: prevent empty messages, enforce 2000 character limit
- [ ] T043 Add loading state to send button in ChatInput.tsx (disable button and show loading indicator while message is being sent)
- [ ] T044 Implement retry mechanism for failed messages in useChat.ts
- [ ] T045 Add React.memo to ChatMessage.tsx component to prevent unnecessary re-renders
- [ ] T046 Verify no memory leaks by testing extended chat session (20+ messages) and checking browser memory usage
- [ ] T047 Test complete user flow: login → dashboard → open chat → send 5 messages → close chat → reopen → verify history → logout
- [ ] T048 Verify zero regression: test existing task CRUD operations still work correctly
- [ ] T049 Verify zero regression: test authentication flows (login, logout, session management) still work correctly
- [ ] T050 Performance test: verify modal opens in <1 second, messages render in <100ms
- [ ] T051 Cross-browser testing: verify functionality in Chrome, Firefox, Safari, and Edge
- [ ] T052 Create manual testing checklist document at specs/006-chatbot-ui/TESTING.md with all acceptance scenarios

**Checkpoint**: Feature complete and production-ready

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T001-T005) - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion (T006-T008)
  - User Story 1 (Phase 3): Can start after Foundational - No dependencies on other stories
  - User Story 2 (Phase 4): Can start after Foundational - Builds on US1 but independently testable
  - User Story 3 (Phase 5): Can start after Foundational - Enhances US1/US2 but independently testable
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundation only - MVP can ship with just this story
- **User Story 2 (P2)**: Foundation only - Can implement in parallel with US1 if desired
- **User Story 3 (P3)**: Foundation only - Can implement in parallel with US1/US2 if desired

### Within Each User Story

- Tasks within a story should be executed in order (T009 → T010 → T011...)
- Tasks marked [P] within a phase can run in parallel
- Each story should be validated independently before moving to next priority

### Parallel Opportunities

**Phase 1 (Setup):**
- T001-T004 can run in parallel (different directories/files)

**Phase 2 (Foundational):**
- T006 (chatService) and T007 (chatReducer) can run in parallel

**Phase 3 (User Story 1):**
- T009, T010, T011 can run in parallel (different component files)

**Phase 5 (User Story 3):**
- T027, T028, T029 can run in parallel (different component files)
- T030-T033 should run sequentially (accessibility features build on each other)

**Phase 6 (Polish):**
- T039, T040, T041 can run in parallel (different files/concerns)

---

## Parallel Example: Foundational Phase

```bash
# Launch these tasks together after Setup is complete:
Task T006: "Create chatService.ts with API integration"
Task T007: "Create chatReducer.ts with state management"

# Then launch sequentially:
Task T008: "Create useChat.ts hook" (depends on T006, T007)
```

---

## Parallel Example: User Story Implementation

```bash
# After Foundational phase is complete, these can run in parallel:

# Developer A works on User Story 1:
Task T009-T020: Basic chat interaction components

# Developer B works on User Story 2:
Task T021-T026: Conversation continuity features

# Developer C works on User Story 3:
Task T027-T038: Responsive design and accessibility

# Then all developers collaborate on Polish:
Task T039-T052: Error handling, performance, testing
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T008) - CRITICAL
3. Complete Phase 3: User Story 1 (T009-T020)
4. **STOP and VALIDATE**: Test chat with basic commands
5. Deploy/demo if ready - **This is a functional MVP!**

**MVP Delivers**: Floating chat button, modal interface, send/receive messages, backend integration

### Incremental Delivery

1. **Foundation** (Setup + Foundational) → Chat infrastructure ready
2. **MVP** (+ User Story 1) → Basic chat interaction → Deploy/Demo
3. **Enhanced** (+ User Story 2) → Conversation history → Deploy/Demo
4. **Polished** (+ User Story 3) → Responsive + accessible → Deploy/Demo
5. **Production-Ready** (+ Polish) → Error handling + performance → Production

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers:

1. **Together**: Complete Setup + Foundational (T001-T008)
2. **Parallel**: Once Foundational is done:
   - Developer A: User Story 1 (T009-T020)
   - Developer B: User Story 2 (T021-T026)
   - Developer C: User Story 3 (T027-T038)
3. **Together**: Polish tasks (T039-T052)

---

## Task Count Summary

- **Phase 1 (Setup)**: 5 tasks
- **Phase 2 (Foundational)**: 3 tasks (BLOCKING)
- **Phase 3 (User Story 1 - P1)**: 12 tasks 🎯 MVP
- **Phase 4 (User Story 2 - P2)**: 6 tasks
- **Phase 5 (User Story 3 - P3)**: 12 tasks
- **Phase 6 (Polish)**: 14 tasks

**Total**: 52 tasks

**MVP Scope** (Recommended first delivery): Phase 1 + Phase 2 + Phase 3 = 20 tasks

**Parallel Opportunities**:
- 4 tasks in Setup phase
- 2 tasks in Foundational phase
- 3 tasks in User Story 1 phase
- 3 tasks in User Story 3 phase
- 3 tasks in Polish phase
- All user stories (Phase 3-5) can run in parallel after Foundational

---

## Notes

- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **No test tasks**: Tests not explicitly requested in specification - focus on implementation and manual validation
- **Independent stories**: Each user story should be independently completable and testable
- **Frontend only**: All work in frontend/ directory
- **Zero regression**: Must not break existing task CRUD or authentication features
- **Session-based**: No database persistence, conversation history is session-only
- **Commit frequently**: After each task or logical group
- **Stop at checkpoints**: Validate story independently before proceeding

---

## Success Criteria

Feature is complete when:

- ✅ Floating chat button visible on all dashboard pages (FR-001)
- ✅ Modal opens/closes correctly with overlay (FR-002, FR-013, FR-014)
- ✅ User and assistant messages display correctly (FR-003, FR-004)
- ✅ Input field and send button functional (FR-005, FR-006)
- ✅ Loading indicator shows during message processing (FR-007, FR-008)
- ✅ Empty message validation works (FR-009)
- ✅ 2000 character limit enforced (FR-010, FR-011)
- ✅ Auto-scroll to latest message (FR-012)
- ✅ Session-based conversation history (FR-015)
- ✅ Backend integration with JWT auth (FR-016)
- ✅ Error handling for API failures (FR-017, FR-018)
- ✅ Responsive design (mobile, tablet, desktop) (FR-020)
- ✅ Theme consistency with dashboard (FR-021)
- ✅ Zero regression in task CRUD (FR-022)
- ✅ Zero regression in authentication (FR-023, FR-024)

All success criteria map to specific user stories and implementation tasks above.
