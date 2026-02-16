# Implementation Plan: Frontend Chatbot UI Integration

**Branch**: `006-chatbot-ui` | **Date**: 2026-02-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-chatbot-ui/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add a chatbot interface to the Quantum Todo frontend that allows users to manage tasks through natural language. The feature consists of a floating button (bottom-right corner) that opens a centered modal with a chat interface. Users can send messages to the AI agent and receive conversational responses. The chat interface displays user messages (right-aligned) and assistant messages (left-aligned) with loading indicators and error handling. The implementation is frontend-only, integrating with the existing POST /api/chat backend endpoint from feature 002-openai-agent-integration.

**Technical Approach**: Build a reusable React component (`ChatWidget`) using Next.js App Router patterns, Tailwind CSS for styling, and React hooks for state management. The component will be conditionally rendered on authenticated dashboard pages and will communicate with the backend via fetch API with JWT authentication.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 15+ (App Router)
**Primary Dependencies**: React 18+, Next.js 15+, Tailwind CSS 3.x
**Storage**: Session-based state management (React useState/useReducer), no persistence
**Testing**: Jest + React Testing Library for component tests
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge) - desktop and mobile
**Project Type**: Web application (frontend only)
**Performance Goals**:
- Modal opens in <1 second
- Message rendering <100ms
- Smooth scrolling at 60fps
- No memory leaks during extended sessions

**Constraints**:
- Must not break existing task CRUD features
- Must not interfere with authentication flows
- Must be responsive (320px - 2560px width)
- Must match existing Tailwind theme
- Session-based only (no conversation persistence)

**Scale/Scope**:
- Single user per session
- Up to 50 messages per conversation
- 2000 character limit per message
- 10 requests/minute rate limit (handled by backend)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle 2.1: Spec-Driven Implementation
**Status**: ✅ PASS
- Feature specification complete at `specs/006-chatbot-ui/spec.md`
- All requirements documented with acceptance criteria
- User stories prioritized (P1-P3)

### Principle 2.2: Monorepo Discipline
**Status**: ✅ PASS
- Feature is frontend-only, lives in `frontend/` directory
- Clear boundary: UI components only, no business logic
- Backend integration via REST API (feature 002 dependency)

### Principle 2.3: Deterministic over Clever
**Status**: ✅ PASS
- Simple component-based architecture
- Standard React patterns (hooks, props, state)
- No complex abstractions or premature optimization
- Straightforward fetch API for backend communication

### Principle 2.4: Reproducibility
**Status**: ✅ PASS
- Specification documents all behavior
- Implementation plan captures technical decisions
- Quickstart guide will provide setup instructions

### Section 4.1: Frontend Rules
**Status**: ✅ PASS
- All data fetching via REST API (POST /api/chat)
- No direct database access
- State management for UI concerns only (message history, modal state)
- Follows `frontend/CLAUDE.md` guidelines

### Section 4.3: Database Rules
**Status**: ✅ PASS (N/A)
- No database interaction from frontend
- Backend handles all data persistence
- User isolation enforced by backend

### Section 5: Authentication & Security
**Status**: ✅ PASS
- JWT authentication required (inherited from existing auth)
- No secrets in frontend code
- User isolation enforced by backend API

### Section 6: Specification Governance
**Status**: ✅ PASS
- Spec created before implementation
- No conflicts with existing specs
- Consistent with backend API contract (feature 002)

**Constitution Check Result**: ✅ ALL GATES PASSED

No violations detected. Feature aligns with all constitution principles.

## Project Structure

### Documentation (this feature)

```text
specs/006-chatbot-ui/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (to be created)
├── data-model.md        # Phase 1 output (to be created)
├── quickstart.md        # Phase 1 output (to be created)
├── contracts/           # Phase 1 output (to be created)
│   └── component-api.md # Component props and interfaces
├── checklists/
│   └── requirements.md  # Spec quality checklist (complete)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatWidget.tsx          # Main chat component
│   │   │   ├── ChatButton.tsx          # Floating button
│   │   │   ├── ChatModal.tsx           # Modal container
│   │   │   ├── ChatMessages.tsx        # Messages list
│   │   │   ├── ChatMessage.tsx         # Single message bubble
│   │   │   ├── ChatInput.tsx           # Input field + send button
│   │   │   ├── ChatLoading.tsx         # Loading indicator
│   │   │   └── ChatError.tsx           # Error message display
│   │   └── [existing components...]
│   ├── hooks/
│   │   ├── useChat.ts                  # Chat state management hook
│   │   └── [existing hooks...]
│   ├── services/
│   │   ├── chatService.ts              # API integration for chat
│   │   └── [existing services...]
│   ├── types/
│   │   ├── chat.ts                     # TypeScript interfaces for chat
│   │   └── [existing types...]
│   ├── app/
│   │   ├── dashboard/
│   │   │   └── layout.tsx              # Add ChatWidget here
│   │   └── [existing pages...]
│   └── styles/
│       └── [existing styles...]
└── tests/
    ├── components/
    │   └── chat/
    │       ├── ChatWidget.test.tsx
    │       ├── ChatModal.test.tsx
    │       ├── ChatMessages.test.tsx
    │       └── ChatInput.test.tsx
    └── [existing tests...]
```

**Structure Decision**: Frontend-only feature using Next.js App Router structure. Components organized in a dedicated `chat/` subdirectory under `components/`. Custom hook (`useChat`) for state management. Service layer (`chatService`) for API integration. TypeScript interfaces in `types/chat.ts`. Tests co-located with implementation in `tests/components/chat/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. This section is not applicable.

---

## Phase 0: Research & Technology Decisions

**Status**: ✅ Complete

**Output**: `research.md` with technology choices and best practices

**Research Areas Completed**:
1. ✅ Next.js 15 App Router patterns for modal components → Client Component with Portal pattern
2. ✅ React state management patterns for chat interfaces → useReducer for complex state
3. ✅ Tailwind CSS modal and overlay patterns → Utility classes with custom animations
4. ✅ Accessibility best practices for chat widgets → ARIA attributes + keyboard navigation
5. ✅ Performance optimization for message lists → Auto-scroll + conditional rendering
6. ✅ Error handling patterns for API integration → Try-catch with user-friendly messages

**Key Decisions**:
- State Management: useReducer (complex state, predictable updates)
- Modal Pattern: React Portal (z-index isolation)
- Styling: Tailwind CSS (consistent with existing theme)
- API Integration: Fetch API (native, no dependencies)
- Accessibility: ARIA + focus management (WCAG compliance)

---

## Phase 1: Design & Contracts

**Status**: ✅ Complete

**Outputs**:
- ✅ `data-model.md`: Client-side data structures (Message, ChatState, ChatAction)
- ✅ `contracts/component-api.md`: Component props and interfaces (10 components documented)
- ✅ `quickstart.md`: Developer setup and usage guide (10-step implementation guide)

**Design Decisions Made**:
1. ✅ Component hierarchy: ChatWidget → ChatModal → ChatMessages/ChatInput
2. ✅ State management: useReducer with 8 action types
3. ✅ API integration: chatService with error handling
4. ✅ Error handling: User-friendly messages, retry mechanism
5. ✅ Responsive design: Mobile (<768px), Tablet (768-1024px), Desktop (>1024px)
6. ✅ Theme integration: Existing Tailwind config, gradient colors

---

## Constitution Check (Post-Design Re-evaluation)

*Re-evaluated after Phase 1 design completion*

### Principle 2.1: Spec-Driven Implementation
**Status**: ✅ PASS
- Design artifacts align with specification
- All functional requirements addressed in component contracts
- No scope creep detected

### Principle 2.3: Deterministic over Clever
**Status**: ✅ PASS
- Simple component-based architecture maintained
- No unnecessary abstractions introduced
- Standard React patterns (hooks, reducers, portals)
- Complexity justified (useReducer for complex state, Portal for z-index)

### Principle 2.4: Reproducibility
**Status**: ✅ PASS
- Comprehensive documentation created (research, data-model, contracts, quickstart)
- Clear implementation path defined
- All design decisions documented with rationale

**Post-Design Constitution Check Result**: ✅ ALL GATES PASSED

Design maintains alignment with constitution principles. No violations introduced during planning phase.

---

## Next Steps

1. ✅ Constitution Check passed (initial)
2. ✅ Phase 0: Created `research.md` with technology decisions
3. ✅ Phase 1: Created `data-model.md`, `contracts/`, and `quickstart.md`
4. ✅ Constitution Check passed (post-design)
5. ✅ Agent context updated with new technology
6. ⏳ Phase 2: Run `/sp.tasks 006-chatbot-ui` to generate task breakdown
7. ⏳ Phase 3: Implementation via `/sp.implement 006-chatbot-ui`

---

**Plan Status**: ✅ COMPLETE - Ready for Task Generation

All planning phases complete. Feature is ready for task breakdown and implementation.
