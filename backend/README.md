# Methodist Community Four App - Backend API

Backend API for the Methodist Community Four mobile app built with Node.js, Express, MongoDB, and TypeScript.

## Features

- **Authentication**: JWT-based authentication with access and refresh tokens
- **Role-Based Access Control**: Admin, Pastor, Clerk, Class Leader, Sunday School Teacher, Member roles
- **Announcement System**: Member submission workflow with clerk approval
- **Events Calendar**: Manage church events and activities
- **Morning Devotionals**: Class leaders send daily devotionals to their class
- **Attendance Tracking**: Track Sunday service and Sunday school attendance
- **Member Management**: Comprehensive member and class management

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Language**: TypeScript

## Project Structure

```
backend/
├── src/
│   ├── config/           # Database configuration
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Auth & error handling
│   ├── models/           # Mongoose schemas (12 collections)
│   ├── routes/           # API routes
│   ├── utils/            # Helper functions (auth, etc.)
│   └── server.ts         # Express app entry point
├── .env.example          # Environment variables template
├── package.json
└── tsconfig.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your MongoDB connection string and secrets:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/methodist-community-four
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
PORT=3000
NODE_ENV=development
```

### 3. MongoDB Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Add database user with username and password
4. Whitelist your IP address (or use 0.0.0.0/0 for testing)
5. Get connection string and update `MONGODB_URI` in `.env`

### 4. Run Development Server

```bash
npm run dev
```

The API will start on `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication (`/api/v1/auth`)

- `POST /register` - Register new user
- `POST /login` - Login user
- `POST /refresh-token` - Refresh access token
- `POST /logout` - Logout user (protected)
- `GET /me` - Get current user (protected)

### Announcements (`/api/v1/announcements`)

- `POST /` - Submit announcement (member)
- `GET /my-submissions` - Get user's submissions (member)
- `GET /pending` - Get pending announcements (clerk/admin)
- `GET /sunday-schedule` - Get approved announcements (clerk/admin)
- `PUT /:id/approve` - Approve announcement (clerk/admin)
- `PUT /:id/reject` - Reject announcement (clerk/admin)
- `PUT /:id/mark-announced` - Mark as announced on Sunday (clerk/admin)

### Events (`/api/v1/events`)

- `GET /` - Get upcoming events (all authenticated)
- `GET /:id` - Get event by ID (all authenticated)
- `POST /` - Create event (admin/pastor)
- `PUT /:id` - Update event (admin/pastor)
- `DELETE /:id` - Delete event (admin/pastor)

### Devotionals (`/api/v1/devotionals`)

- `GET /my-class` - Get devotionals for my class (member)
- `PUT /:id/mark-read` - Mark as read (member)
- `PUT /:id/like` - Like devotional (member)
- `POST /` - Create devotional (class leader/admin)
- `GET /` - Get my published devotionals (class leader/admin)
- `PUT /:id` - Update devotional (class leader/admin)
- `DELETE /:id` - Delete devotional (class leader/admin)

## Database Collections

1. **users** - Authentication and user management
2. **members** - Church members
3. **classes** - Church classes/groups
4. **announcements** - Announcement submission workflow
5. **devotionals** - Daily devotionals
6. **events** - Church events
7. **attendance** - Sunday service attendance
8. **sundayschoolclasses** - Sunday school classes
9. **sundayschoolstudents** - Sunday school students
10. **sundayschoolattendance** - Sunday school attendance
11. **auditlogs** - Security and accountability logs

## Testing the API

Use tools like Postman, Insomnia, or curl to test the endpoints:

```bash
# Health check
curl http://localhost:3000/health

# Register user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123",
    "fullName": "John Doe",
    "phone": "+1234567890",
    "role": "member"
  }'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## Security Features

- Passwords hashed with bcrypt (12 rounds)
- JWT access tokens (15-minute expiry)
- JWT refresh tokens (7-day expiry)
- Role-based authorization
- Input validation
- CORS enabled
- Soft deletes for data recovery

## Next Steps

1. Set up MongoDB Atlas cluster
2. Configure environment variables
3. Test authentication endpoints
4. Create initial admin user
5. Test core features (announcements, events, devotionals)
6. Connect mobile app to API

## License

MIT
