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
*Last Updated: November 1, 2025*

### Initial Replit Setup
- Installed Node.js 20 and all npm dependencies
- Configured Vite to run on port 5000 with proper HMR settings for Replit's proxy environment
- Set up GEMINI_API_KEY secret for Google's Gemini AI service
- Created dev workflow running on port 5000
- Configured deployment for autoscale with build and preview commands
- Application tested and confirmed working

## Project Architecture

### Technology Stack
- **Frontend Framework**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 6.2.0
- **AI Service**: Google Gemini AI (@google/genai)
- **Styling**: Tailwind CSS (via CDN)
- **Authentication**: Mock authentication using localStorage (frontend-only)

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
├── services/           # Service layer
│   ├── authService.ts      # Mock authentication
│   ├── contentHistoryService.ts
│   └── geminiService.ts    # Gemini AI integration
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
├── types.ts            # TypeScript type definitions
├── vite.config.ts      # Vite configuration
└── package.json        # Dependencies
```

### Key Features
1. **Content Analysis**: Analyze text, images, or URLs using Gemini AI
2. **Multi-Platform Support**: Generate posts for LinkedIn, Twitter, Instagram, and Threads
3. **Tone Control**: Adjust content tone (Professional, Casual, Inspiring, etc.)
4. **History Tracking**: View previously generated content
5. **Trending Topics**: Display current trending topics in the sidebar

### Environment Configuration
- **Development Port**: 5000 (configured for Replit's webview)
- **Required Secret**: GEMINI_API_KEY (Google AI Studio API key)
- **Host**: 0.0.0.0 (allows Replit proxy access)
- **HMR**: Configured for Replit's HTTPS proxy on port 443

### Authentication
The app uses a mock authentication system stored in localStorage. This is a frontend-only implementation with no backend server. Users can "sign in" with a simulated Google auth button that creates a mock user session.

### Deployment
The app is configured for Replit's autoscale deployment:
- **Build Command**: `npm run build`
- **Run Command**: `npx vite preview --host 0.0.0.0 --port`
- **Deployment Type**: Autoscale (suitable for stateless web applications)

## User Preferences
None specified yet.

## Notes
- The application is frontend-only with no backend server
- Tailwind CSS is loaded via CDN (not recommended for production)
- Content history is stored in localStorage
- For production use, consider installing Tailwind CSS properly and implementing real authentication

## Known Limitations
- **URL Content Extraction**: The current implementation asks Gemini AI to analyze URLs, but Gemini cannot actually fetch web page content. This means the feature may not work reliably for extracting real content from URLs. For production, consider implementing server-side URL fetching with a library like `node-fetch` or Puppeteer to retrieve actual page content before sending it to Gemini for analysis.
- **Vite allowedHosts**: Set to `true` for development to work with Replit's proxy. This is safe for development but should be restricted in production builds.
