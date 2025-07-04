# LinkBzaar - SaaS Platform Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Project Overview](#project-overview)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Features](#features)
6. [Installation and Setup](#installation-and-setup)
7. [API Documentation](#api-documentation)
8. [Frontend Components](#frontend-components)
9. [Authentication](#authentication)
10. [External Integrations](#external-integrations)
11. [Admin Panel](#admin-panel)
12. [Seller Dashboard](#seller-dashboard)
13. [Deployment](#deployment)
14. [Testing](#testing)
15. [Future Enhancements](#future-enhancements)

## Introduction

LinkBzaar is a comprehensive SaaS platform that provides a marketplace for users to buy, sell, and discover products and services. The platform connects buyers with sellers, facilitates classified ads, and integrates with external product sources through a scraper API.

## Project Overview

LinkBzaar aims to create a seamless marketplace experience with the following objectives:
- Provide a platform for users to post and browse classified ads
- Enable sellers to manage their product listings
- Implement robust user authentication and authorization
- Offer comprehensive admin tools for platform management
- Integrate external product data through a scraper API
- Deliver a responsive, user-friendly interface with modern design principles

## Technology Stack

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling tool
- **JWT**: JSON Web Tokens for authentication
- **Passport.js**: Authentication middleware
- **Nodemailer**: Email sending functionality
- **Multer**: File upload handling

### Frontend
- **React**: JavaScript library for building user interfaces
- **React Router**: Navigation and routing
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/UI**: UI component library
- **Axios**: HTTP client for API requests
- **Framer Motion**: Animation library

### External Services
- **Google OAuth**: Authentication with Google
- **Google Maps API**: Location services
- **FastAPI Scraper**: Python-based web scraping service
- **Socket.io**: Real-time communication for chat functionality

## Project Structure

The project follows a client-server architecture with separate directories for frontend and backend code.

### Server Structure
```
server/
├── config/         # Configuration files
├── controllers/    # Controller logic
├── middleware/     # Middleware functions
├── models/         # Mongoose models
├── routes/         # Express routes
├── services/       # Service functions
├── utils/          # Utility functions
├── seeds/          # Database seeding scripts
├── socket.js       # Socket.io configuration and event handlers
├── server.js       # Main server file
└── package.json    # Project dependencies
```

### Client Structure
```
client/
├── public/         # Static files
├── src/
│   ├── components/ # React components
│   │   ├── admin/  # Admin-specific components
│   │   ├── auth/   # Authentication components
│   │   ├── chat/   # Chat-related components
│   │   ├── common/ # Shared components
│   │   ├── layout/ # Layout components
│   │   └── ui/     # UI components
│   ├── context/    # React context providers
│   ├── hooks/      # Custom React hooks
│   ├── pages/      # Page components
│   │   └── admin/  # Admin pages
│   ├── routes/     # Routing configuration
│   ├── services/   # API service functions
│   ├── utils/      # Utility functions
│   ├── App.jsx     # Main App component
│   └── main.jsx    # Entry point
└── package.json    # Project dependencies
```

### Scraper Service
```
scraper/
├── app/
│   ├── schemas/    # Data schemas
│   └── scraper/    # Scraping logic
└── main.py         # FastAPI application
```

## Features

### User Authentication
- Registration with email verification
- Login with email and password
- Google OAuth integration
- JWT-based authentication
- Role-based authorization (user, seller, admin)
- Email verification with OTP
- Password reset functionality

### Product Management
- Create, read, update, delete (CRUD) operations for products
- Product categorization
- Product search and filtering
- Product image upload

### Classified Ads
- Post classified ads with details and images
- Browse and search classifieds
- Filter by category, price, location
- Contact sellers through the platform
- Chat with sellers in real-time

### Seller Dashboard
- Overview of seller metrics
- Manage product listings
- View and respond to inquiries
- Track listing performance
- Manage conversations with buyers

### Admin Panel
- User management
- Content moderation
- Platform metrics and analytics
- System settings

### External Product Search
- Integration with scraper API
- Search products from external websites
- Compare prices across platforms

### Location Services
- Google Maps integration
- Location-based search
- Display seller locations

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Python 3.8+ (for scraper service)

### Backend Setup
1. Clone the repository
2. Navigate to the server directory:
   ```
   cd server
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file based on the provided `.env.example`
5. Seed the database:
   ```
   npm run seed
   ```
6. Start the server:
   ```
   npm run dev
   ```

### Frontend Setup
1. Navigate to the client directory:
   ```
   cd client
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

### Scraper Service Setup
1. Navigate to the scraper directory:
   ```
   cd scraper
   ```
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Start the FastAPI server:
   ```
   uvicorn main:app --reload
   ```

## Frontend Components

The LinkBzaar frontend is built with React and follows a component-based architecture for maximum reusability and maintainability.

### Layout Components
- **MainLayout**: Primary layout for public pages
- **DashboardLayout**: Layout for seller dashboard
- **AdminLayout**: Layout for admin panel
- **Navbar**: Navigation bar with responsive design
- **Footer**: Site footer with links and information

### UI Components
- **Button**: Customizable button component with variants
- **Card**: Container component for content display
- **Input**: Form input components with validation
- **Modal**: Dialog component for overlays
- **Toast**: Notification component for user feedback
- **Dropdown**: Menu component for options
- **Pagination**: Component for paginated content

### Common Components
- **Avatar**: User profile picture component with fallback to name initials
- **GoogleMap**: Google Maps integration component
- **LoadingSpinner**: Loading indicator
- **EmptyState**: Component for empty data states
- **ErrorBoundary**: Error handling component

### Chat Components
- **ConversationList**: List of user conversations
- **MessageList**: List of messages in a conversation
- **MessageInput**: Input field for sending messages
- **ChatPage**: Main chat interface

### Authentication Components
- **LoginForm**: User login form
- **RegisterForm**: User registration form
- **EmailVerification**: Email verification with OTP
- **GoogleSignIn**: Google OAuth integration button
- **ProtectedRoute**: Route wrapper for authentication

### Design Principles
The frontend follows Apple.com style design principles:
- Clean, minimalist interface
- Ample white space
- High-quality imagery
- Subtle animations and transitions
- Consistent typography and color scheme
- Responsive design for all device sizes

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/UI**: Component library with consistent styling
- **Custom theme**: Brand colors and typography
- **Dark mode support**: Toggle between light and dark themes

## API Documentation

The LinkBzaar API follows RESTful principles and is organized by resource type.

### Authentication Endpoints
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `POST /api/users/verify-email` - Verify email with OTP
- `GET /api/users/google` - Initiate Google OAuth flow
- `GET /api/users/google/callback` - Google OAuth callback
- `POST /api/users/logout` - Logout user

### Chat Endpoints
- `GET /api/chat/conversations` - Get all conversations for the current user
- `GET /api/chat/conversations/:id` - Get a specific conversation by ID
- `POST /api/chat/conversations` - Create a new conversation
- `GET /api/chat/conversations/:id/messages` - Get messages for a conversation
- `PUT /api/chat/conversations/:id/read` - Mark messages as read

### Product Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Classified Endpoints
- `GET /api/classifieds` - Get all classifieds
- `GET /api/classifieds/:id` - Get classified by ID
- `POST /api/classifieds` - Create new classified
- `PUT /api/classifieds/:id` - Update classified
- `DELETE /api/classifieds/:id` - Delete classified

### Dashboard Endpoints
- `GET /api/dashboard/:sellerId` - Get seller dashboard data

### Admin Endpoints
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user by ID
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `DELETE /api/admin/classifieds/:id` - Delete classified
- `DELETE /api/admin/products/:id` - Delete product

### Scraper Endpoints
- `POST /api/scraper/search-and-scrape` - Search and scrape products
- `POST /api/scraper/scrape` - Scrape product details from URL

## Authentication

LinkBzaar implements a comprehensive authentication system with multiple methods:

### Local Authentication
- Email and password-based authentication
- Password hashing with bcrypt
- JWT token generation and validation
- Email verification with OTP

### Google OAuth Integration
- Sign in with Google account
- Automatic profile creation
- Role assignment (new Google users are assigned seller role)
- Profile picture integration

### JWT Implementation
- Tokens stored in localStorage
- Token expiration and refresh
- Protected routes with role-based access

## External Integrations

### Google Maps API
- Interactive maps for location selection
- Geocoding for address to coordinates conversion
- Display of seller locations
- Location-based search functionality

### Email Service
- Verification emails with OTP
- Welcome emails for new users
- Password reset emails
- Notification emails for various events

### Scraper API
- FastAPI-based scraping service
- Product search across external websites
- Price comparison functionality
- Integration with main search results

### Real-time Chat
- Socket.io for real-time communication
- Private messaging between buyers and sellers
- Message read status tracking
- Unread message notifications
- Conversation management

## Admin Panel

The admin panel provides comprehensive tools for platform management:

### Dashboard
- Overview of platform metrics
- User statistics
- Listing statistics
- Quick action buttons

### User Management
- View all users
- Edit user details
- Change user roles
- Activate/deactivate users
- Delete users

### Content Management
- Moderate classified ads
- Review product listings
- Remove inappropriate content
- Feature selected listings

## Seller Dashboard

The seller dashboard provides tools for sellers to manage their business:

### Overview
- Performance metrics
- Listing statistics
- Inquiry statistics
- Recent activity

### Listing Management
- Create new listings
- Edit existing listings
- Activate/deactivate listings
- Delete listings

### Analytics
- View listing performance
- Track views and inquiries
- Monitor response rates
- Analyze customer engagement

## Deployment

### Development Environment
- Local development using Node.js and npm
- Vite development server for frontend
- Nodemon for backend auto-reloading

### Production Deployment
- Backend: Node.js server on a cloud platform (AWS, Heroku, etc.)
- Frontend: Static file hosting (Netlify, Vercel, etc.)
- Database: MongoDB Atlas for cloud database hosting
- Scraper: FastAPI deployment on a separate service

### Environment Variables
The following environment variables need to be configured:

#### Backend Variables
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT signing
- `JWT_EXPIRE`: JWT expiration time
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `GOOGLE_CALLBACK_URL`: Google OAuth callback URL
- `EMAIL_HOST`: SMTP server host
- `EMAIL_PORT`: SMTP server port
- `EMAIL_USER`: SMTP server username
- `EMAIL_PASSWORD`: SMTP server password
- `EMAIL_FROM`: Sender email address
- `FRONTEND_URL`: URL of the frontend application
- `SCRAPER_API_URL`: URL of the scraper service
- `SOCKET_CORS_ORIGIN`: Allowed origins for Socket.io connections

#### Frontend Variables
- `VITE_API_URL`: Backend API URL
- `VITE_GOOGLE_MAPS_API_KEY`: Google Maps API key

## Testing

### Backend Testing
- API testing using Postman collections
- Endpoint testing grouped by user roles
- Unit tests for critical functions
- Integration tests for API endpoints

### Frontend Testing
- Component testing with React Testing Library
- End-to-end testing with Cypress
- Manual testing for UI/UX

### Test Users
After seeding the database, the following test users are available:

- **Admin User**:
  - Email: admin@linkbzaar.com
  - Password: admin123
  - Role: admin

- **Seller User**:
  - Email: seller@linkbzaar.com
  - Password: seller123
  - Role: seller

- **Regular User**:
  - Email: user@linkbzaar.com
  - Password: user123
  - Role: user

## Future Enhancements

Potential future enhancements for the LinkBzaar platform:

1. **Payment Integration**: Add payment processing for direct purchases
2. **Mobile Application**: Develop native mobile apps for iOS and Android
3. **Advanced Analytics**: Provide more detailed analytics for sellers
4. **Review System**: Implement user reviews and ratings
5. **Recommendation Engine**: Add AI-based product recommendations
6. **Multi-language Support**: Add support for multiple languages
7. **Enhanced Search**: Implement more advanced search algorithms
8. **Social Media Integration**: Allow sharing listings on social platforms
9. **Subscription Plans**: Implement tiered subscription plans for sellers
10. **Advanced Chat Features**: Add file sharing, voice messages, and group chats

## Conclusion

The LinkBzaar platform provides a comprehensive marketplace solution with robust features for users, sellers, and administrators. The project demonstrates the implementation of modern web development practices, including:

- Full-stack JavaScript development with Node.js and React
- RESTful API design and implementation
- Real-time communication with Socket.io
- NoSQL database modeling with MongoDB and Mongoose
- Authentication and authorization with JWT and Passport
- Third-party service integrations (Google OAuth, Google Maps, Email)
- Responsive UI design with Tailwind CSS
- Component-based frontend architecture

The modular architecture of the platform allows for easy maintenance and future enhancements. The separation of concerns between client, server, and scraper services provides flexibility and scalability as the platform grows.

By following this documentation, developers can understand the project structure, set up the development environment, and contribute to the ongoing development of the LinkBzaar platform.
