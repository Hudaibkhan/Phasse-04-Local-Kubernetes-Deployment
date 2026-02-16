# Quickstart Guide: Phase 2 Stability and Errors Fix

## Prerequisites

- Node.js 18+ installed
- Python 3.11+ installed
- pnpm or npm package manager
- Access to Neon PostgreSQL database

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd evolution_todo
```

### 2. Install Dependencies

#### Frontend Setup
```bash
cd frontend
pnpm install  # or npm install
```

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt  # or poetry install if using Poetry
```

### 3. Configure Environment Variables

#### Frontend Configuration
Create `.env.local` in the frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Backend Configuration
Create `.env` in the backend directory:
```env
DATABASE_URL=postgresql://username:password@host:port/database
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 4. Run the Applications

#### Frontend
```bash
cd frontend
pnpm dev  # or npm run dev
```

#### Backend
```bash
cd backend
uvicorn main:app --reload --port 8000
```

## Troubleshooting Common Issues

### Frontend Issues
- **CSS not loading**: Check that `frontend/src/styles/globals.css` is imported in your root layout
- **Module import errors**: Verify `tsconfig.json` contains proper path aliases like `"@/*": ["./src/*"]`
- **Path alias issues**: Ensure `baseUrl` is set in `tsconfig.json`

### Backend Issues
- **HTTP 500 errors**: Check server logs for specific error messages
- **Database connection issues**: Verify DATABASE_URL is correct and database is accessible
- **Authentication failures**: Ensure JWT secret and algorithm are properly configured

## Running Tests

### Frontend Tests
```bash
cd frontend
pnpm test  # or npm test
```

### Backend Tests
```bash
cd backend
pytest
```