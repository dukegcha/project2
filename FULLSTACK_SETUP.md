# Full-Stack Restaurant Reservation System Setup

This guide shows how to run both the frontend (Next.js) and backend (Node.js/Express) together.

## Quick Start

### 1. Start the Backend Server

First, you need to get the backend files from the main branch and run the server:

```bash
# Get backend files from main branch
git show origin/main:backend/server.js > backend-server.js
git show origin/main:backend/database.js > backend-database.js
git show origin/main:backend/package.json > backend-package.json

# Create backend directory and copy files
mkdir -p backend
mv backend-*.js backend/
mv backend-package.json backend/package.json

# Get other backend files
git show origin/main:backend/middleware/auth.js > backend/middleware/auth.js
git show origin/main:backend/middleware/authorize.js > backend/middleware/authorize.js
git show origin/main:backend/config/email.js > backend/config/email.js

# Install backend dependencies
cd backend
npm install

# Start the backend server
node server.js
```

The backend will run on **http://localhost:3000**

### 2. Start the Frontend (in a new terminal)

```bash
# Install frontend dependencies (if not done already)
npm install

# Start the Next.js development server
npm run dev
```

The frontend will run on **http://localhost:3003**

## Environment Variables

Create a `.env.local` file in the frontend root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## How It Works

### Backend API Endpoints
- `POST /register` - User registration
- `POST /login` - User login
- `GET /availability?date=YYYY-MM-DD&party_size=N` - Check available slots
- `POST /reservations` - Create reservation (requires auth)
- `GET /reservations/history` - Get user's reservations (requires auth)

### Frontend Features
- **Reservation Form**: Date picker, party size selector, time slot selection
- **Authentication**: Login/Register modals with JWT token storage
- **Real-time Availability**: Fetches available time slots from backend
- **Reservation Creation**: Authenticated users can book reservations
- **Email Confirmations**: Backend sends confirmation emails

### Integration Flow
1. User selects date and party size
2. Frontend calls `/availability` API to get available time slots
3. User selects time and clicks "Make Reservation"
4. If not authenticated, login/register modal appears
5. After authentication, reservation is created via `/reservations` API
6. Backend sends confirmation email and returns success
7. Frontend shows success message and resets form

## Database

The backend automatically creates a SQLite database (`restaurant.db`) with:
- Users table (authentication)
- Reservations table (bookings)
- Tables table (restaurant inventory)
- Email templates

## Testing the Integration

1. **Register a new user** - Use the Sign Up button
2. **Check availability** - Select a future date and party size
3. **Make a reservation** - Choose an available time slot
4. **Confirm booking** - Should receive success message

## Troubleshooting

- **CORS Issues**: Backend includes CORS headers for frontend
- **Port Conflicts**: Backend uses 3000, frontend uses 3003
- **Database Issues**: Delete `restaurant.db` to reset database
- **Authentication**: Check browser localStorage for 'authToken'

## Production Deployment

For production:
1. Set `NEXT_PUBLIC_API_URL` to your backend server URL
2. Use environment variables for JWT secrets and database
3. Configure email SMTP settings in backend
4. Deploy backend and frontend separately