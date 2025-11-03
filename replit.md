# Content Studio

## Overview
Content Studio is an AI-powered web application that helps users analyze content and generate engaging social media posts. The app uses Google's Gemini AI to:
- Analyze text, images, or URLs
- Generate social media posts in different styles (LinkedIn, Twitter, Instagram, Threads)
- Provide key insights and interesting facts
- Generate relevant hashtags
- Show trending topics

**Current State**: The application is fully configured and running in the Replit environment with all dependencies installed and the Gemini API integrated.

## Recent Changes
*Last Updated: November 3, 2025*

### Authentication Redirect URI Fix (Latest)
- **Fixed "invalid_redirect_uri" error** in webview preview during login
- **Updated OAuth callback URL**: Now uses REPLIT_DOMAINS environment variable instead of req.hostname
- **Consistent authentication**: Login works in both webview preview and published site
- **Single strategy approach**: Removed dynamic per-hostname strategies, using one consistent strategy

### Production Deployment Fix
- **Fixed "Cannot GET /" error** in production deployment
- **Unified server architecture**: Express now serves both API and static files in production
- **Production mode detection**: Uses NODE_ENV environment variable
- **Proper external access**: Server binds to 0.0.0.0 in production (127.0.0.1 in development)
- **Deployment configuration**: Single command runs Express server on port 5000
- **Tested and verified**: Production mode successfully serves static files and API routes

### Replit Authentication Integration (Latest)
- **Replaced mock authentication** with real Replit Auth supporting Google, GitHub, Twitter (X), Apple, and email/password login
- **Created PostgreSQL database** with users and sessions tables for account management
- **Implemented backend authentication** using Passport.js and OpenID Connect
- **Updated frontend** with useAuth hook and real user session management
- **All components updated** to use real user data (firstName, lastName, email, profileImageUrl)
- **Authentication endpoints ready**: `/api/login`, `/api/logout`, `/api/callback`, `/api/auth/user`
- **TypeScript/JavaScript interoperability**: Split schema into `schema.js` (runtime) and `schema.d.ts` (types) to support both Node.js backend and React frontend

### Backend Server & Security
- Created Express.js backend for URL content fetching and authentication
- Added SSRF protection and CORS configuration
- Backend runs on localhost:3001 (proxied via Vite)
- All authentication state managed server-side with secure sessions

### Initial Replit Setup
- Installed Node.js 20 and all npm dependencies
- Configured Vite to run on port 5000 with proper HMR settings for Replit's proxy environment
- Set up GEMINI_API_KEY secret for Google's Gemini AI service
- Created dev workflow running both frontend and backend servers
- Configured deployment for VM with build and run commands
- Application tested and confirmed working

## Project Architecture

### Technology Stack
- **Frontend Framework**: React 19.2.0 with TypeScript
- **Backend**: Node.js with Express 5.1.0
- **Build Tool**: Vite 6.2.0
- **Database**: PostgreSQL (Replit-hosted) with Drizzle ORM
- **Authentication**: Replit Auth (Passport.js + OpenID Connect)
- **AI Service**: Google Gemini AI (@google/genai)
- **Session Management**: express-session with PostgreSQL storage
- **Styling**: Tailwind CSS (via CDN)

### Project Structure
```
.
├── components/          # React components
│   ├── icons/          # SVG icon components
│   ├── ContentInput.tsx
│   ├── ContentOutput.tsx
│   ├── Header.tsx
│   ├── HistoryView.tsx
│   ├── LandingPage.tsx
│   ├── LeftSidebar.tsx
│   └── RightSidebar.tsx
├── hooks/              # React hooks
│   └── useAuth.ts      # Authentication hook
├── services/           # Service layer
│   ├── authService.ts      # Legacy mock auth (unused)
│   ├── contentHistoryService.ts
│   └── geminiService.ts    # Gemini AI integration
├── server/             # Backend server (JavaScript)
│   ├── db.js           # Database connection
│   ├── replitAuth.js   # Authentication setup
│   └── storage.js      # Database operations
├── shared/             # Shared code
│   ├── schema.js       # Database schema (Drizzle runtime)
│   └── schema.d.ts     # TypeScript type definitions
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
├── server.js           # Express backend server
├── types.ts            # TypeScript type definitions
├── vite.config.ts      # Vite configuration
├── drizzle.config.ts   # Drizzle ORM configuration
└── package.json        # Dependencies
```

### Key Features
1. **Content Analysis**: Analyze text, images, or URLs using Gemini AI
2. **Multi-Platform Support**: Generate posts for LinkedIn, Twitter, Instagram, and Threads
3. **Tone Control**: Adjust content tone (Professional, Casual, Inspiring, etc.)
4. **History Tracking**: View previously generated content
5. **Trending Topics**: Display current trending topics in the sidebar

### Environment Configuration
- **Frontend Port**: 5000 (configured for Replit's webview)
- **Backend Port**: 3001 (proxied through Vite)
- **Required Secrets**: 
  - GEMINI_API_KEY (Google AI Studio API key)
  - DATABASE_URL (PostgreSQL connection string - auto-configured)
  - SESSION_SECRET (auto-generated by Replit)
- **Host**: 0.0.0.0 (allows Replit proxy access)
- **HMR**: Configured for Replit's HTTPS proxy on port 443

### Authentication
The app uses **Replit Auth**, a production-ready authentication system that supports:
- **Multiple providers**: Google, GitHub, Twitter (X), Apple, email/password
- **Secure sessions**: Server-side session management with PostgreSQL storage
- **OpenID Connect**: Industry-standard authentication protocol
- **Automatic user management**: User accounts stored in PostgreSQL database

**Auth Flow**:
1. User clicks "Sign in" button → redirected to `/api/login`
2. Replit shows auth provider selection screen
3. User authenticates with chosen provider
4. Replit redirects back to `/api/callback`
5. Session created and user redirected to home page
6. Frontend checks auth status via `/api/auth/user` endpoint

### Deployment
The app is configured for Replit's VM deployment:
- **Build Command**: `npm run build`
- **Run Command**: `NODE_ENV=production PORT=5000 node server.js`
- **Deployment Type**: VM (required for stateful authentication with sessions and database)
- **Production Mode**: Express serves both API routes and static frontend files from dist/
- **Database**: Automatically migrated to production on deployment

**Production Architecture:**
In production, the Express server handles everything on port 5000:
- Static files served from `dist/` folder
- API routes under `/api/*` prefix
- Authentication endpoints
- Catch-all route for client-side routing (serves index.html)

## User Preferences
None specified yet.

## Database Management
- **Schema Definition**: `shared/schema.js` (Drizzle ORM)
- **Migrations**: Run `npm run db:push` to sync schema changes to database
- **Tables**: 
  - `users`: Stores user account information (id, email, firstName, lastName, profileImageUrl)
  - `sessions`: Stores session data for authentication (managed by express-session)

## Notes
- Tailwind CSS is loaded via CDN (not recommended for production - consider installing properly)
- Content history is currently stored in localStorage (should be migrated to database per-user)
- Backend files in `server/` are JavaScript for Node.js compatibility
- Database schema uses split approach: `schema.js` for runtime (Node.js imports) and `schema.d.ts` for TypeScript types (React imports)

## Backend Server
The application now includes a Node.js/Express backend server (`server.js`) that:
- Fetches real URL content using native fetch API
- Parses HTML content with cheerio to extract titles and main text
- Includes SSRF protection (blocks private IPs, localhost, and non-standard protocols)
- Runs on localhost:3001 in development
- Proxied through Vite dev/preview server via `/api` routes

## Security Features
- **SSRF Protection**: The backend validates URLs and blocks obvious private IP addresses, localhost, and non-HTTP(S) protocols
- **CORS Configuration**: Uses exact-match origin validation in production
- **URL Validation**: Enforces HTTPS/HTTP protocols and standard ports only

## Security Considerations & Limitations
- **DNS Rebinding Risk**: The current SSRF protection checks the URL hostname string but doesn't perform DNS resolution. An attacker with control over DNS could potentially bypass this by creating a domain that resolves to a private IP address. For high-security environments, consider implementing DNS-based validation using Node's dns.lookup() before fetching.
- **Vite allowedHosts**: Set to `true` for development to work with Replit's proxy. This is development-only and doesn't affect production builds.
- **Content History**: Stored in browser localStorage, which means data is local to each device and can be cleared by the user.
