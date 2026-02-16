# API Contracts: Dashboard UI and Task Filtering

## Overview
This feature implements client-side filtering and UI enhancements without introducing new API endpoints. It relies on existing task retrieval endpoints.

## Existing Endpoints Used

### GET /api/tasks
- **Purpose**: Retrieve tasks for the current user
- **Method**: GET
- **Authentication**: Required (via existing auth mechanism)
- **Response**: Array of task objects with all properties needed for filtering
- **Usage**: Data source for client-side filtering

### POST /api/tasks
- **Purpose**: Create new tasks (unchanged)
- **Method**: POST
- **Authentication**: Required
- **Usage**: Task creation remains unchanged

### PUT /api/tasks/{id}
- **Purpose**: Update task (unchanged)
- **Method**: PUT
- **Authentication**: Required
- **Usage**: Task updates remain unchanged

## Client-Side Filtering Contract
The filtering functionality operates entirely on the client-side using JavaScript. No new API endpoints are introduced.

### Filter Parameters (Client-Side Only)
- **searchTerm**: String to match against title and description
- **priorities**: Array of priority values to include
- **tags**: Array of tag values to include

### Filtering Algorithm
The filtering algorithm is implemented in the client and follows these rules:
1. Search matches are case-insensitive
2. Priority filtering is inclusive (shows tasks matching any selected priority)
3. Tag filtering is inclusive (shows tasks matching any selected tag)
4. All filters are combined with AND logic