# Deoghar Kitab

A book marketplace for students of classes 1-12, competitive exams, and government exams.

## Project Structure

```
deoghar-kitab-reads/
├── frontend/          # React frontend application
├── backend/           # Node.js/Express backend server
├── package.json       # Root package.json for managing both frontend and backend
└── README.md          # This file
```

## Technologies Used

### Frontend
- React with TypeScript
- Vite as build tool
- Tailwind CSS for styling
- React Router for navigation
- Shadcn UI components
- Framer Motion for animations

### Backend
- Node.js
- Express.js
- MongoDB (planned)
- JWT for authentication (planned)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd deoghar-kitab-reads
   ```

2. Install dependencies for all parts of the project:
   ```bash
   npm run install:all
   ```

### Running the Application

#### Development Mode

To run both frontend and backend in development mode simultaneously:
```bash
npm run dev
```

To run only the frontend:
```bash
npm run dev:frontend
```

To run only the backend:
```bash
npm run dev:backend
```

#### Production Mode

To build the frontend:
```bash
npm run build:frontend
```

To start the frontend in preview mode:
```bash
npm run start:frontend
```

To start the backend:
```bash
npm run start:backend
```

## Project Structure Details

### Frontend
```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utility functions
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Entry point
├── public/             # Static assets
├── index.html          # HTML template
├── package.json        # Frontend dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite configuration
└── README.md           # Frontend documentation
```

### Backend
```
backend/
├── src/
│   ├── controllers/    # Request handlers
│   ├── models/         # Data models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── config/         # Configuration files
│   └── server.js       # Main server file
├── package.json        # Backend dependencies and scripts
└── README.md           # Backend documentation
```

## Deployment

This project is configured for deployment on Vercel for the frontend. Backend deployment options will be determined based on requirements.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any queries, please contact the development team.