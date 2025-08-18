# Vibe Coder Agent API Documentation

## Overview

The Vibe Coder Agent provides both REST API endpoints and WebSocket connections for real-time interaction with the multi-agent development system.

## Base URL

```
http://localhost:3000
```

## Authentication

Currently, the API does not require authentication. This may change in future versions.

## REST API Endpoints

### System Status

#### GET `/api/status`

Get the current system status including agent information and task queue status.

**Response:**
```json
{
  "initialized": true,
  "agents": {
    "architect": {
      "status": "ready",
      "completedTasks": 5,
      "currentTask": null,
      "errors": 0
    },
    "frontend": {
      "status": "ready",
      "completedTasks": 3,
      "currentTask": null,
      "errors": 0
    }
  },
  "runningTasks": 0,
  "queuedTasks": 0
}
```

### Agent Information

#### GET `/api/agents`

Get detailed information about all available agents.

**Response:**
```json
{
  "architect": {
    "name": "architect",
    "initialized": true,
    "busy": false,
    "currentTask": null,
    "config": {
      "specialization": "system_design",
      "capabilities": [
        "architecture_design",
        "technology_selection",
        "scalability_planning"
      ]
    }
  },
  "frontend": {
    "name": "frontend", 
    "initialized": true,
    "busy": false,
    "currentTask": null,
    "config": {
      "specialization": "ui_development",
      "capabilities": [
        "component_creation",
        "styling",
        "state_management"
      ]
    }
  }
}
```

### Task Execution

#### POST `/api/tasks`

Execute a task using the appropriate agents.

**Request Body:**
```json
{
  "type": "create_project",
  "description": "Create a modern e-commerce web application",
  "requirements": {
    "projectName": "my-shop",
    "type": "web_app",
    "frontend": "react",
    "backend": "node.js",
    "database": "postgresql",
    "features": ["authentication", "payments"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "projectId": "uuid-here",
    "structure": {
      "projectStructure": { ... },
      "technologyStack": { ... }
    },
    "files": {
      "frontend": [...],
      "backend": [...]
    },
    "instructions": [
      "Install dependencies: npm install",
      "Set up environment variables",
      "Start development server"
    ],
    "nextSteps": [
      "Review generated code structure",
      "Customize configuration files",
      "Add business logic"
    ]
  }
}
```

## Task Types

### Project Creation

**Type:** `create_project`

Create a new application from scratch with the specified requirements.

**Required Fields:**
- `type`: Task type
- `description`: Project description
- `requirements.type`: Project type (`web_app`, `mobile_app`, `api_service`)

**Optional Fields:**
- `requirements.projectName`: Custom project name
- `requirements.frontend`: Frontend framework preference
- `requirements.backend`: Backend framework preference  
- `requirements.database`: Database preference
- `requirements.features`: Array of desired features

**Example:**
```json
{
  "type": "create_project",
  "description": "Create a task management web application",
  "requirements": {
    "projectName": "task-manager",
    "type": "web_app",
    "frontend": "react",
    "backend": "node.js", 
    "database": "mongodb",
    "features": ["authentication", "real-time", "notifications"]
  }
}
```

### Code Debugging

**Type:** `debug_code`

Analyze existing code for bugs, security issues, and performance problems.

**Required Fields:**
- `type`: Task type
- `requirements.files`: Array of files to analyze

**Optional Fields:**
- `requirements.issues`: Array of issue types to focus on (`all`, `security`, `performance`, `quality`, `bugs`)

**Example:**
```json
{
  "type": "debug_code",
  "description": "Analyze authentication module for security issues",
  "requirements": {
    "files": [
      {
        "path": "src/auth/login.js",
        "content": "// file content here"
      },
      "/path/to/auth.js"
    ],
    "issues": ["security", "bugs"]
  }
}
```

### Code Review

**Type:** `review_code`

Review code quality, adherence to best practices, and suggest improvements.

**Required Fields:**
- `type`: Task type
- `requirements.files`: Array of files to review

**Example:**
```json
{
  "type": "review_code", 
  "description": "Review React components for best practices",
  "requirements": {
    "files": ["src/components/UserProfile.jsx"]
  }
}
```

### Performance Optimization

**Type:** `optimize_performance`

Analyze and suggest optimizations for application performance.

**Required Fields:**
- `type`: Task type
- `requirements`: Performance analysis requirements

### Application Deployment

**Type:** `deploy_application`

Set up deployment configuration and infrastructure.

**Required Fields:**
- `type`: Task type
- `requirements`: Deployment requirements and preferences

## WebSocket API

Connect to the WebSocket endpoint for real-time communication:

```javascript
const socket = io('http://localhost:3000');
```

### Events

#### Client to Server

**`execute_task`**
Execute a task with real-time progress updates.

```javascript
socket.emit('execute_task', {
  type: 'create_project',
  description: 'Create a blog application',
  requirements: {
    type: 'web_app',
    frontend: 'react'
  }
});
```

**`get_agents`**
Request current agent status.

```javascript
socket.emit('get_agents');
```

#### Server to Client

**`status`**
Receive system status updates.

```javascript
socket.on('status', (status) => {
  console.log('System status:', status);
});
```

**`task_progress`**
Receive task progress updates.

```javascript
socket.on('task_progress', (data) => {
  console.log(`Progress: ${data.progress}%`);
});
```

**`task_completed`**
Receive task completion notification.

```javascript
socket.on('task_completed', (data) => {
  console.log('Task completed:', data.result);
});
```

**`task_error`**
Receive task error notifications.

```javascript
socket.on('task_error', (data) => {
  console.error('Task failed:', data.error);
});
```

**`agents_status`**
Receive agent status information.

```javascript
socket.on('agents_status', (agents) => {
  console.log('Agents:', agents);
});
```

## Error Handling

All API endpoints return appropriate HTTP status codes:

- `200` - Success
- `400` - Bad Request (invalid task data)
- `500` - Internal Server Error

Error responses include a message:

```json
{
  "success": false,
  "error": "Invalid task request: missing required field 'type'"
}
```

## Rate Limiting

Currently no rate limiting is implemented, but this may be added in future versions.

## Examples

### JavaScript/Node.js

```javascript
// REST API example
const response = await fetch('http://localhost:3000/api/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'create_project',
    description: 'Create a portfolio website',
    requirements: {
      type: 'web_app',
      frontend: 'react'
    }
  })
});

const result = await response.json();
console.log(result);
```

### Python

```python
import requests

# REST API example
response = requests.post('http://localhost:3000/api/tasks', json={
    'type': 'debug_code',
    'description': 'Analyze Python script for issues',
    'requirements': {
        'files': [{'path': 'script.py', 'content': '# code here'}],
        'issues': ['all']
    }
})

result = response.json()
print(result)
```

### cURL

```bash
# Get system status
curl http://localhost:3000/api/status

# Execute a task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "type": "create_project",
    "description": "Create a chat application",
    "requirements": {
      "type": "web_app",
      "features": ["real-time", "authentication"]
    }
  }'
```

## Health Check

The API provides a health check endpoint:

#### GET `/health`

Returns the service health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```
