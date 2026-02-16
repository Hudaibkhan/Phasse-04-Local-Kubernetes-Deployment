---
id: 2
title: Simplify Task Toggle Logic
stage: refactor
date: 2026-02-02
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: 1-notification-page
user: unknown
command: /sp.phr
labels: ["ui-sync", "refactor", "task-completion", "pattern-consistency"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - E:\Q4_Officail\hackathon_02\evolution_todo\frontend\src\app\dashboard\page.tsx
tests:
 - none
---

## Prompt

# 🔧 Fix Task Toggle + Recurring Task UI Sync (DO NOT BREAK WORKING FEATURES)

## Context
- Task **delete** and **update** work perfectly
- Task **completion** works but **recurring task does NOT appear immediately**
- New recurring task appears only after full page reload
- Backend recurrence logic is correct
- This is a **frontend state sync issue**

---

## HARD RULES (VERY IMPORTANT)
- ❌ Do NOT change backend logic
- ❌ Do NOT change database schema or migrations
- ❌ Do NOT refactor unrelated code
- ❌ Do NOT break delete, update, auth, or task creation
- ❌ Do NOT add new APIs
- ✅ Modify **only `handleToggleTask`** logic

---

## Step 1 — Analyze (No Coding Yet)
In `dashboard/page.tsx`, compare:
- `handleDeleteTask`
- `handleUpdateTask`
- `handleToggleTask`

Identify:
- How delete/update update React state
- What pattern they follow after success
- Why `handleToggleTask` behaves differently

---

## Step 2 — Fix `handleToggleTask`
You MUST:

1. **Stop refetching all tasks**
   - Remove the conditional `/tasks` refetch logic
   - Delete/update do not refetch — follow same pattern

2. **Normalize backend response**
   - Backend may return:
     - `updatedTask`
     - `{ task, new_task }`
     - `{ created_task }`
   - Safely extract the newly created recurring task if present

3. **Update state correctly**
   - Immediately toggle completed state in UI
   - If a new recurring task exists → append it to `tasks` state

### Required State Logic Pattern

```ts
// update completed task locally
setTasks(prev =>
  prev.map(t =>
    t.id === taskId
      ? { ...t, completed: !t.completed }
      : t
  )
);

// append new recurring task if returned
if (newTask) {
  setTasks(prev => [newTask, ...prev]);
}
```

---

## Step 3 — What NOT To Do
- ❌ Do NOT rely on page reload
- ❌ Do NOT depend on old task.completed value
- ❌ Do NOT refetch all tasks unless backend explicitly returns nothing

---

## Step 4 — Verification Checklist
After implementation:

- ✅ Completing a recurring task instantly shows new task
- ✅ No page reload required

---

## Response snapshot

Simplified the handleToggleTask function to follow the same pattern as delete and update handlers, removing the refetching logic and focusing on immediate state updates for better UI synchronization.

## Outcome

- ✅ Impact: Simplified handleToggleTask function to follow same pattern as delete/update handlers, removing unnecessary refetching logic
- 🧪 Tests: none
- 📁 Files: E:\Q4_Officail\hackathon_02\evolution_todo\frontend\src\app\dashboard\page.tsx
- 🔁 Next prompts: none
- 🧠 Reflection: The function now follows consistent pattern with other handlers for better maintainability and predictable behavior

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A