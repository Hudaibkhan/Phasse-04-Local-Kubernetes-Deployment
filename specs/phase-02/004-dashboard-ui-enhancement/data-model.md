# Data Model: Dashboard UI and Task Filtering

## Task Display Item

Represents a task in the UI with all display properties.

### Properties
- **id**: `string` - Unique identifier for the task
- **title**: `string` - Primary display text for the task
- **description**: `string` - Secondary display text, shown below title
- **priority**: `"high" | "medium" | "low"` - Priority level for badge display
- **due_date**: `string | null` - Due date in ISO format or null if not set
- **tags**: `string[]` - Array of tag strings to display as chips
- **completed**: `boolean` - Boolean indicating completion status

### Validation Rules
- title must be non-empty string
- priority must be one of the allowed values
- tags must be an array of strings (can be empty)
- completed must be boolean

## Filter State

Contains active filter criteria for client-side filtering.

### Properties
- **searchTerm**: `string` - Text to search for in title and description (case-insensitive)
- **selectedPriorities**: `("high" | "medium" | "low")[]` - Array of selected priority levels to show
- **selectedTags**: `string[]` - Array of tag values to filter by

### Validation Rules
- searchTerm can be empty string (no search filter)
- selectedPriorities can be empty array (no priority filter)
- selectedTags can be empty array (no tag filter)
- All arrays should not contain duplicates

## Filtered Tasks Result

Result of applying filters to task list.

### Properties
- **originalTasks**: `TaskDisplayItem[]` - Original unfiltered task list
- **filteredTasks**: `TaskDisplayItem[]` - Tasks after applying all filters
- **appliedFilters**: `FilterState` - The filter criteria that were applied

## Dashboard Layout Configuration

Defines the structure of the dashboard UI.

### Properties
- **sections**: Object containing layout sections:
  - taskCreation: Configuration for task creation area
  - filterControls: Configuration for filter controls area
  - taskList: Configuration for task display area
- **responsiveBreakpoints**: Tailwind breakpoints for responsive behavior
- **spacing**: Spacing configuration using Tailwind spacing scale