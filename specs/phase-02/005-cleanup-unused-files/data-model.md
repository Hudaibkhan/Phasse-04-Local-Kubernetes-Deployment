# Data Model: Cleanup Unused & Test Files

## Overview
The cleanup feature doesn't introduce new data entities but operates on the file system structure of the codebase. This document describes the conceptual data model for tracking file cleanup operations.

## Key Entities

### FileEntry
Represents a file in the codebase that may be subject to cleanup evaluation.

- **filePath**: String - Absolute path to the file
- **fileName**: String - Name of the file
- **fileType**: Enum (source, asset, test, temp, config, other) - Classification of file type
- **lastModified**: DateTime - Timestamp of last modification
- **references**: List<String> - Paths of files that import/reference this file
- **isUsed**: Boolean - Whether the file is currently used by the application
- **isSafeToDelete**: Boolean - Whether it's safe to delete this file
- **reason**: String - Reason for keeping or deleting the file

### CleanupOperation
Represents a cleanup operation that removes unused files.

- **operationId**: String - Unique identifier for the operation
- **timestamp**: DateTime - When the operation was performed
- **removedFiles**: List<FileEntry> - Files that were removed
- **preservedFiles**: List<FileEntry> - Files that were kept
- **validationResult**: ValidationResult - Result of post-cleanup validation

### ValidationResult
Represents the result of validating that functionality remains intact after cleanup.

- **isValid**: Boolean - Whether validation passed
- **testsPassed**: Integer - Number of tests that passed
- **testsFailed**: Integer - Number of tests that failed
- **functionalChecks**: List<FunctionalCheck> - Specific functionality checks
- **errors**: List<String> - Any errors encountered during validation

### FunctionalCheck
Represents a specific functionality check performed after cleanup.

- **checkName**: String - Name of the check (e.g., "auth-flow", "task-creation")
- **passed**: Boolean - Whether the check passed
- **description**: String - Description of what was tested
- **errorMessage**: String - Error message if check failed

## Relationships
- One CleanupOperation contains many FileEntry instances (both removed and preserved)
- One ValidationResult contains many FunctionalCheck instances
- Many FileEntry instances contribute to one ValidationResult

## Validation Rules
- A file should only be deleted if isSafeToDelete is true
- All functionality checks must pass after a cleanup operation
- The number of removed files should be logged for audit purposes

## State Transitions
- FileEntry: Unknown → Analyzed → SafeToDelete | Preserved
- CleanupOperation: Planned → Executing → Completed | Failed
- ValidationResult: Pending → Validating → Valid | Invalid