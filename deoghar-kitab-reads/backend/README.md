# Deoghar Kitab Backend

This is the backend server for Deoghar Kitab - A book marketplace for students of classes 1-12, competitive exams, and government exams.

## Technologies Used

- Node.js
- Express.js
- MongoDB (to be implemented)
- JWT for authentication (to be implemented)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Server

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will start on port 3000 by default.

## API Endpoints

- `GET /` - Server status
- `GET /health` - Health check

## Project Structure

```
backend/
├── src/
│   └── server.js      # Main server file
├── package.json       # Project dependencies and scripts
├── .gitignore         # Git ignore file
└── README.md          # This file
```

## Future Development

This backend is a starting point and will be expanded to include:
- User authentication and authorization
- Book listing and management
- Order processing
- Payment integration
- Database integration (MongoDB)
- Admin dashboard APIs