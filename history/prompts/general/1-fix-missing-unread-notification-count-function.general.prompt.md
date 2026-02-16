---
id: 1
title: Fix Missing calculateUnreadNotificationCount Function
stage: general
date: 2026-02-02
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: 1-notification-page
user: Claude
command: "fix missing calculateUnreadNotificationCount function in enhanced-notification-calculator.ts"
labels: ["bug-fix", "typescript", "notifications", "header-component"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - E:\Q4_Officail\hackathon_02\evolution_todo\frontend\src\utils\enhanced-notification-calculator.ts
tests:
  - E:\Q4_Officail\hackathon_02\evolution_todo\frontend\src\components\layout\Header.tsx
  - E:\Q4_Officail\hackathon_02\evolution_todo\frontend\src\hooks\useEnhancedNotificationCount.ts
---

# Prompt History Record: Fix Missing calculateUnreadNotificationCount Function

## Context
The `calculateUnreadNotificationCount` function was missing from the `enhanced-notification-calculator.ts` file, causing a runtime TypeError in the Header component. The function was being imported and used but not defined, leading to an undefined function error.

## Issue Description
The Header component was importing `calculateUnreadNotificationCount` from `../../utils/enhanced-notification-calculator` and using it to display notification counts in the UI (lines 119-122 and 281-284). Additionally, the `useEnhancedNotificationCount` hook was importing and using the same function. Since the function didn't exist, this caused a runtime TypeError when the application tried to execute the function.

## Solution Implemented
Added the missing `calculateUnreadNotificationCount` function to the `enhanced-notification-calculator.ts` file. The function calculates the count of unread notifications from the provided tasks by:

1. Checking if tasks exist and are not empty
2. Calculating all enhanced notifications using the existing `calculateEnhancedNotifications` function
3. Returning the length of the resulting notifications array

## Code Changes
Added the following function to `frontend/src/utils/enhanced-notification-calculator.ts`:

```typescript
/**
 * Calculate the count of unread notifications from tasks
 */
export const calculateUnreadNotificationCount = (tasks: Task[]): number => {
  if (!tasks || tasks.length === 0) {
    return 0;
  }

  // Calculate all enhanced notifications first
  const notifications = calculateEnhancedNotifications(tasks);

  // Count the notifications (all calculated notifications are considered "unread" initially)
  return notifications.length;
};
```

## Files Modified
- `frontend/src/utils/enhanced-notification-calculator.ts`: Added the missing function
- `frontend/src/components/layout/Header.tsx`: Now properly uses the function to display notification counts
- `frontend/src/hooks/useEnhancedNotificationCount.ts`: Now properly uses the function to calculate notification count

## Testing
Verified that the function properly calculates notification counts by:
1. Ensuring the Header component displays the correct notification count badge
2. Confirming the useEnhancedNotificationCount hook operates correctly
3. Checking that no more TypeError occurs when accessing the function

## Outcome
The runtime TypeError in the Header component has been resolved. The notification count is now properly calculated and displayed in the UI, improving the user experience by showing accurate notification counts.

## Evaluation
The fix successfully addresses the missing function issue and resolves the runtime error. The implementation follows the existing patterns in the codebase and properly handles edge cases like empty task arrays.