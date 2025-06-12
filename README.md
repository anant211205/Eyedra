# Eyedra - Lost & Found Platform

## Overview

Eyedra is a comprehensive lost and found platform that connects people who have lost items with those who have found them. The application provides a user-friendly interface for posting lost items, reporting found items, and managing claims in a secure environment.

## Features

### Core Functionality
- **Post Lost Items**: Users can quickly post details about lost belongings with photos and descriptions
- **Report Found Items**: Users can report items they've found to help others recover their belongings
- **Claim System**: Secure process for claiming ownership or reporting found items
- **Search & Filter**: Advanced filtering options to help users find relevant posts
- **User Authentication**: Secure login and registration system

### Technical Features
- **Modern UI**: Built with Material UI for a responsive, clean interface
- **Cloud Storage**: Image uploads powered by Cloudinary
- **MongoDB Database**: Robust data storage and retrieval
- **Next.js Framework**: Server-side rendering and API routes
- **TypeScript**: Type-safe development environment

## Getting Started

### Prerequisites
- Node.js 18.x or later
- MongoDB instance (local or cloud-based)
- Cloudinary account for image storage

### Environment Variables
Create a `.env.local` file at the root of the project with the following variables:

```
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/anant211205/seeforit.git
cd seeforit
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Seed the database with initial data (optional):
```bash
npm run seed
```

### Building for Production

```bash
npm run build
npm run start
```

## Project Structure

```
seeforit/
├── app/                    # Next.js app directory
│   ├── (app)/              # Main app routes
│   ├── (auth)/             # Authentication routes
│   └── api/                # API endpoints
├── components/             # React components
│   ├── auth/               # Authentication components
│   ├── claims/             # Claim management components
│   ├── feed/               # Feed and post listing components
│   └── post/               # Post creation and display components
├── context/                # React context providers
├── lib/                    # Utility functions and configurations
├── models/                 # MongoDB schemas
├── public/                 # Static assets
└── scripts/                # Database seeding scripts
```

## API Routes

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/[...nextauth]` - NextAuth authentication endpoints

### Posts
- `GET /api/get-all-posts` - Retrieve all posts with filters
- `POST /api/create-post` - Create a new post
- `GET /api/posts/[postid]` - Get a specific post
- `DELETE /api/posts/[postid]` - Delete a post

### Claims
- `POST /api/claim/[postid]` - Create a claim for a post
- `GET /api/claims` - Get all claims
- `POST /api/claims/[claimid]/approve` - Approve a claim
- `POST /api/claims/[claimid]/deny` - Deny a claim

## Data Models

### User
- Authentication credentials
- Profile information
- Contact details

### Post
- Type: Lost or Found
- Category and details
- Location and date
- Status (unclaimed, claim in progress, claimed)

### Claim
- Ownership claims (for lost items)
- Finder claims (for found items)
- Owner requests (direct communication)
- Status tracking

### Media
- Post images
- Claim proof images

## Technologies Used

- **Frontend**: Next.js, Material UI
- **Backend**: Next.js API routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Image Storage**: Cloudinary
- **Styling**: Material UI with Emotion

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request.

