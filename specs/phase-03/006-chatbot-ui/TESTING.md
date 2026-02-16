# Frontend Chatbot UI Integration - Testing Checklist

**Feature**: 006-chatbot-ui
**Status**: Implementation Complete - Ready for Testing
**Date**: 2026-02-09

---

## Pre-Testing Setup

- [ ] Backend server is running on port 8000
- [ ] Frontend dev server is running (npm run dev)
- [ ] User is logged in with valid JWT token
- [ ] Backend `/chat` endpoint is implemented and functional

---

## Phase 1: Basic Functionality (User Story 1 - MVP)

### Chat Button
- [ ] Floating chat button is visible in bottom-right corner on dashboard
- [ ] Button has indigo-to-purple gradient styling
- [ ] Button hover effect works (scale animation)
- [ ] Button is accessible via keyboard (Tab to focus, Enter to activate)
- [ ] Button has proper ARIA label ("Open chat")

### Modal Opening/Closing
- [ ] Clicking chat button opens modal
- [ ] Modal appears centered on screen with backdrop overlay
- [ ] Modal has "Chat Assistant" title with gradient styling
- [ ] Close button (X) in header closes modal
- [ ] Clicking backdrop overlay closes modal
- [ ] Pressing Escape key closes modal
- [ ] Modal uses portal rendering (check z-index isolation)

### Message Sending
- [ ] Input field is auto-focused when modal opens
- [ ] User can type message in input field
- [ ] Send button is enabled when message has content
- [ ] Send button is disabled when input is empty
- [ ] Pressing Enter sends message (without Shift)
- [ ] Pressing Shift+Enter creates new line in input
- [ ] Message appears in chat as user message (right-aligned, gradient background)
- [ ] Loading indicator appears while waiting for response
- [ ] Send button shows "Sending..." with spinner during loading
- [ ] Input field is disabled during loading

### Message Receiving
- [ ] Assistant response appears after backend processes message
- [ ] Assistant message is left-aligned with gray background
- [ ] Messages are displayed in chronological order
- [ ] Auto-scroll to latest message works

### Error Handling
- [ ] Empty message validation prevents sending blank messages
- [ ] Character limit (2000) is enforced
- [ ] Character count appears when approaching limit (>1800 chars)
- [ ] Network errors display error banner with dismiss button
- [ ] API errors (401, 429, 500) display appropriate error messages
- [ ] Error banner can be dismissed by clicking X button
- [ ] Failed messages show error state in message bubble

---

## Phase 2: Conversation Continuity (User Story 2)

### Message History
- [ ] Send 5+ messages in sequence
- [ ] All messages remain visible in chat
- [ ] Scroll container allows scrolling through message history
- [ ] Auto-scroll to latest message works after each new message
- [ ] Messages remain in chronological order

### Session Persistence
- [ ] Close modal after sending messages
- [ ] Reopen modal
- [ ] All previous messages are still visible
- [ ] Conversation history is maintained within session
- [ ] Can continue conversation from where it left off

### Performance with Many Messages
- [ ] Send 10+ messages
- [ ] Scrolling remains smooth
- [ ] No visible lag when rendering messages
- [ ] Auto-scroll still works correctly
- [ ] Memory usage remains stable (check browser DevTools)

---

## Phase 3: Responsive Design (User Story 3)

### Mobile (<768px)
- [ ] Open browser DevTools and set viewport to 375x667 (iPhone SE)
- [ ] Chat button is visible and properly sized
- [ ] Modal takes up most of screen (95vh height)
- [ ] Modal has minimal padding (p-2)
- [ ] Input field and send button are properly sized
- [ ] Text is readable (appropriate font sizes)
- [ ] Touch targets are large enough (buttons, inputs)
- [ ] Scrolling works on touch devices

### Tablet (768-1024px)
- [ ] Set viewport to 768x1024 (iPad)
- [ ] Modal is appropriately sized (max-w-lg)
- [ ] Layout adapts to medium screen size
- [ ] All interactions work smoothly
- [ ] Text and spacing are comfortable

### Desktop (>1024px)
- [ ] Set viewport to 1920x1080
- [ ] Modal is properly sized (max-w-xl)
- [ ] Modal is centered on screen
- [ ] Hover effects work on all interactive elements
- [ ] Layout looks polished and professional

---

## Phase 4: Accessibility (User Story 3)

### Keyboard Navigation
- [ ] Tab key cycles through all interactive elements in modal
- [ ] Tab order is logical (close button → input → send button → back to close)
- [ ] Focus trap works (Tab on last element goes to first)
- [ ] Shift+Tab cycles backwards through elements
- [ ] Escape key closes modal
- [ ] Enter key sends message (when input is focused)
- [ ] All interactive elements have visible focus indicators

### Focus Management
- [ ] Input field is auto-focused when modal opens
- [ ] Focus returns to chat button when modal closes
- [ ] Focus is trapped within modal when open (cannot Tab to elements behind modal)
- [ ] Focus indicators are visible and clear

### ARIA Attributes
- [ ] Modal has role="dialog"
- [ ] Modal has aria-modal="true"
- [ ] Modal has aria-labelledby pointing to title
- [ ] Chat button has aria-label="Open chat"
- [ ] Close button has aria-label="Close chat"
- [ ] Input field has aria-label="Type your message"
- [ ] Error dismiss button has aria-label="Dismiss error"

### Screen Reader Testing (Optional)
- [ ] Test with NVDA (Windows) or VoiceOver (Mac)
- [ ] Modal announces as dialog when opened
- [ ] All interactive elements are announced correctly
- [ ] Messages are announced when received

---

## Phase 5: Theme Consistency

### Color Palette
- [ ] Chat button uses indigo-to-purple gradient (matches dashboard)
- [ ] User messages use indigo-to-purple gradient
- [ ] Assistant messages use slate gray background
- [ ] Modal header title uses gradient text (indigo/purple/pink)
- [ ] Error messages use red color scheme
- [ ] All colors match dashboard theme

### Dark Mode (if implemented)
- [ ] Toggle dark mode in dashboard
- [ ] Modal background adapts to dark mode
- [ ] Text colors are readable in dark mode
- [ ] Borders and shadows work in dark mode
- [ ] All components support dark mode

### Typography & Spacing
- [ ] Font sizes match dashboard (text-sm, text-base, text-lg)
- [ ] Font weights are consistent
- [ ] Spacing (padding, margins) matches dashboard patterns
- [ ] Border radius matches dashboard (rounded-lg, rounded-2xl)

---

## Phase 6: Error Handling & Edge Cases

### Network Errors
- [ ] Disconnect network (DevTools → Network → Offline)
- [ ] Try sending message
- [ ] Error message displays: "Network error. Please check your connection."
- [ ] Reconnect network
- [ ] Retry sending message (if retry button exists)

### API Errors
- [ ] Test 401 Unauthorized (expired token)
- [ ] Error message: "Session expired. Please log in again."
- [ ] Test 429 Too Many Requests (rate limiting)
- [ ] Error message: "Too many requests. Please wait a moment."
- [ ] Test 500 Internal Server Error
- [ ] Generic error message displays

### Validation Errors
- [ ] Try sending empty message (only spaces)
- [ ] Send button remains disabled
- [ ] Try sending message >2000 characters
- [ ] Error message displays about character limit
- [ ] Character count shows warning when >1800 characters

### React Error Boundary
- [ ] Simulate React error (modify component to throw error)
- [ ] Error boundary catches error
- [ ] Fallback UI displays with "Chat Error" message
- [ ] Refresh button works to reload page

---

## Phase 7: Integration & Regression Testing

### Zero Regression - Task CRUD
- [ ] Navigate to dashboard
- [ ] Create a new task
- [ ] Edit an existing task
- [ ] Toggle task completion
- [ ] Delete a task
- [ ] All task operations work correctly (no interference from chat widget)

### Zero Regression - Authentication
- [ ] Log out from dashboard
- [ ] Log back in
- [ ] Chat widget appears after login
- [ ] JWT token is properly included in chat API requests
- [ ] Session management works correctly

### Complete User Flow
- [ ] Start from login page
- [ ] Log in with valid credentials
- [ ] Navigate to dashboard
- [ ] Verify chat button is visible
- [ ] Open chat modal
- [ ] Send message: "Add a task to buy groceries"
- [ ] Receive response from assistant
- [ ] Send follow-up message: "Show my tasks"
- [ ] Receive response
- [ ] Close modal
- [ ] Reopen modal
- [ ] Verify conversation history is preserved
- [ ] Send another message
- [ ] Close modal
- [ ] Perform task CRUD operations
- [ ] Reopen chat
- [ ] Verify chat still works
- [ ] Log out

---

## Phase 8: Performance Testing

### Load Time
- [ ] Open dashboard with chat widget
- [ ] Modal opens in <1 second
- [ ] No visible lag or jank

### Message Rendering
- [ ] Send message
- [ ] Message appears in <100ms
- [ ] Assistant response renders immediately when received
- [ ] No layout shifts or flashing

### Memory Leaks
- [ ] Open chat modal
- [ ] Send 20+ messages
- [ ] Check browser DevTools → Memory
- [ ] Close and reopen modal multiple times
- [ ] Memory usage remains stable (no continuous growth)

### Extended Session
- [ ] Keep chat open for 5+ minutes
- [ ] Send messages periodically
- [ ] No performance degradation
- [ ] No memory leaks
- [ ] All interactions remain responsive

---

## Phase 9: Cross-Browser Testing

### Chrome
- [ ] All functionality works
- [ ] Styling renders correctly
- [ ] Animations are smooth
- [ ] No console errors

### Firefox
- [ ] All functionality works
- [ ] Styling renders correctly
- [ ] Animations are smooth
- [ ] No console errors

### Safari (Mac/iOS)
- [ ] All functionality works
- [ ] Styling renders correctly
- [ ] Animations are smooth
- [ ] No console errors
- [ ] Touch interactions work on iOS

### Edge
- [ ] All functionality works
- [ ] Styling renders correctly
- [ ] Animations are smooth
- [ ] No console errors

---

## Phase 10: Final Acceptance Criteria

### Functional Requirements
- [ ] FR-001: Floating chat button visible on all dashboard pages
- [ ] FR-002: Modal opens/closes correctly
- [ ] FR-003: User messages display correctly
- [ ] FR-004: Assistant messages display correctly
- [ ] FR-005: Input field functional
- [ ] FR-006: Send button functional
- [ ] FR-007: Loading indicator shows during processing
- [ ] FR-008: Loading state disables input
- [ ] FR-009: Empty message validation works
- [ ] FR-010: 2000 character limit enforced
- [ ] FR-011: Character count display works
- [ ] FR-012: Auto-scroll to latest message
- [ ] FR-013: Escape key closes modal
- [ ] FR-014: Overlay click closes modal
- [ ] FR-015: Session-based conversation history
- [ ] FR-016: Backend integration with JWT auth
- [ ] FR-017: Error handling for API failures
- [ ] FR-018: Error messages display correctly
- [ ] FR-020: Responsive design (mobile, tablet, desktop)
- [ ] FR-021: Theme consistency with dashboard
- [ ] FR-022: Zero regression in task CRUD
- [ ] FR-023: Zero regression in authentication
- [ ] FR-024: Focus management works correctly

---

## Known Issues / Notes

**Document any issues found during testing:**

1. Issue: [Description]
   - Steps to reproduce:
   - Expected behavior:
   - Actual behavior:
   - Severity: [Critical/High/Medium/Low]

2. Issue: [Description]
   - Steps to reproduce:
   - Expected behavior:
   - Actual behavior:
   - Severity: [Critical/High/Medium/Low]

---

## Sign-Off

- [ ] All critical tests passed
- [ ] All high-priority tests passed
- [ ] Known issues documented
- [ ] Feature ready for production deployment

**Tested by**: _______________
**Date**: _______________
**Approved by**: _______________
**Date**: _______________

---

## Additional Notes

- Backend endpoint `/chat` must be implemented before testing
- JWT authentication must be working
- Test with realistic message content (task commands, questions, etc.)
- Pay special attention to error handling and edge cases
- Document any browser-specific issues
- Test on real devices when possible (not just DevTools emulation)
