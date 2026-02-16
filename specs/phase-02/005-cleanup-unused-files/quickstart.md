# Quickstart Guide: Cleanup Unused & Test Files

## Overview
This guide explains how to safely identify and remove unused or test-only files from the codebase while ensuring all functionality remains intact.

## Prerequisites
- Git repository in a clean state (committed changes)
- Working application (able to run both frontend and backend)
- All existing tests passing
- Backup of codebase (recommended)

## Step-by-Step Process

### 1. Preparation
```bash
# Ensure all changes are committed
git status
git add .
git commit -m "Backup before cleanup"

# Verify application works
# (Run frontend and backend, test core functionality)
```

### 2. File Discovery
```bash
# Use the following commands to identify potential candidates for removal:

# Find files with test-related names
find . -name "*test*" -o -name "*debug*" -o -name "*temp*" -o -name "*sample*"

# Search for unused imports/references
# (Using ripgrep to search for references to specific files)
rg "FileName" --files-with-matches
```

### 3. Safe Removal Process
1. **Identify candidate files** using static analysis tools
2. **Verify files are unused** by checking for imports/references
3. **Remove one file at a time**
4. **Test application** after each removal
5. **Repeat** until all safe files are removed

### 4. Verification
After each file removal:
- Run the application locally
- Test all core features (authentication, task management)
- Run existing test suite
- Check for console errors

### 5. Final Validation
After completing cleanup:
- Run full test suite
- Perform end-to-end testing of all features
- Verify build process works correctly
- Confirm no regressions were introduced

## Tools for Analysis

### Finding Unused Files
```bash
# Find all JavaScript/TypeScript files that aren't imported anywhere
# This requires more sophisticated analysis than simple grep

# Find files that haven't been modified recently
find . -type f -name "*.js" -o -name "*.ts" -o -name "*.py" | xargs ls -la | sort -k6,7
```

### Verification Commands
```bash
# Run backend tests
cd backend && pytest

# Run frontend tests (if they exist)
cd frontend && npm test

# Start backend
cd backend && uvicorn src.main:app --reload

# Start frontend
cd frontend && npm run dev
```

## Warning Signs
Stop the cleanup process if you encounter:
- Import errors after file removal
- Broken functionality in the application
- Test failures
- Build errors

## Rollback Procedure
If issues occur:
1. Use `git checkout HEAD~1` to revert the last commit
2. Investigate which file removal caused the issue
3. Restore the problematic file
4. Add the file to a "preserve" list to avoid future removal

## Success Indicators
- All tests pass
- Application functions normally
- No console errors
- Codebase size reduced
- No functionality lost