# Copilot Instructions for Mycloud Codebase

## Big Picture Architecture
- This project is a full-stack application with a `frontend` (React + Vite) and a `backend` (Django).
- The `frontend` is located in `frontend/` and uses Vite for development and build. The main entry is `src/main.jsx`.
- The `backend` is in `backend/`, structured as a Django project (`cloudstorage/` as main config, `core/` and `Names/` as apps).
- Data flows from the frontend (user actions) to the backend via API endpoints, likely defined in Django REST Framework views/serializers.
- Media and file uploads are handled in `backend/uploads/` and `backend/media/`.

## Developer Workflows
- **Frontend:**
  - Build/serve: `npm run dev` (port 5173, see `frontend/DOCKERFILE`)
  - Lint: ESLint config in `eslint.config.js`
  - Main files: `src/pages/` for views, `src/assets/` for static assets
- **Backend:**
  - Run: `python manage.py runserver` (see `backend/Dockerfile`)
  - Migrations: `python manage.py makemigrations` and `python manage.py migrate`
  - Tests: `python manage.py test core` or `python manage.py test Names`
- **Docker:**
  - Use `docker-compose.yml` for multi-service orchestration
  - Each service has its own `Dockerfile` (`frontend/DOCKERFILE`, `backend/Dockerfile`)

## Project-Specific Conventions
- **Frontend:**
  - Uses Vite for fast HMR and build
  - React pages are in `src/pages/`, assets in `src/assets/`
  - Entry point: `main.jsx`, root component: `App.jsx`
- **Backend:**
  - Django apps: `core/` and `Names/` (models, views, serializers, urls)
  - Media and uploads: `backend/media/`, `backend/uploads/`
  - Database: SQLite (`db.sqlite3`)
- **API Integration:**
  - Frontend communicates with backend via REST endpoints (see Django views/serializers)
  - Media uploads and file handling are routed through Django

## Integration Points & External Dependencies
- **Frontend:**
  - Depends on Vite, React, ESLint (see `package.json`)
- **Backend:**
  - Depends on Django, Django REST Framework (see `requirements.txt`)
- **Docker:**
  - Node and Python images for isolated environments
  - `docker-compose.yml` orchestrates both services

## Examples & Patterns
- To add a new API endpoint: create a view in `core/views.py` or `Names/views.py`, add serializer, update `urls.py`
- To add a new React page: create a component in `src/pages/`, add route in `src/App.jsx`
- To handle file uploads: use Django's `media/` and `uploads/` directories, configure in `settings.py`

## Key Files & Directories
- `frontend/src/pages/` - React pages
- `frontend/src/App.jsx` - Main app component
- `backend/core/`, `backend/Names/` - Django apps
- `backend/cloudstorage/settings.py` - Django settings
- `backend/requirements.txt` - Python dependencies
- `frontend/package.json` - Node dependencies
- `docker-compose.yml` - Service orchestration

---
For unclear or missing conventions, review `README.md` or ask for clarification from maintainers.
