# Taskflow

Simple task manager built with Django REST Framework and a lightweight vanilla HTML/CSS/JS frontend.

## Preview

![Task Flow UI](frontend/images/Screenshot%202025-10-27%20234853.png)

## What it uses

- Django 5, Django REST Framework
- No frontend framework (just HTML/CSS/JS)

## Quick start (Windows / PowerShell)

```
# Install dependencies
D:/taskflow/Scripts/python.exe -m pip install -r requirements.txt

# Set up the database
D:/taskflow/Scripts/python.exe manage.py migrate

# Run the dev server
D:/taskflow/Scripts/python.exe manage.py runserver
```

Open http://127.0.0.1:8000/ for the frontend.

## API endpoints (CRUD)

- GET /api/tasks/ list tasks
- POST /api/tasks/ create task
- GET /api/tasks/{id}/ retrieve task
- PATCH /api/tasks/{id}/ update task
- DELETE /api/tasks/{id}/ delete task

Example POST body:

```json
{
  "title": "Write docs",
  "description": "README pass",
  "priority": "medium",
  "status": "todo",
  "due_date": "2025-12-01T12:00:00Z"
}
```

Notes:

- priority: low | medium | high
- status: todo | in_progress | done
- description is optional; timestamps are handled automatically

## Frontend

- Lives in `frontend/`
- Works against `/api/tasks/`
- You can create, edit, delete, search, filter (status/priority), and sort

This is intentionally minimal—meant for practising a basic frontend on top of a simple API.
