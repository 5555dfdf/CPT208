# StoryLens

An AI-Powered Personalized Museum Companion (Mobile)

For our source code: <https://github.com/5555dfdf/CPT208>

For our portfolio of system design and iteration: <https://makabakaaaaaaaaa.github.io/CPT208-MuseumProject-A3-3/>

For our system: https://storylens-museum.netlify.app/

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Data Handling](#data-handling)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
  - [Prerequisites](#prerequisites)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)

## Features

StoryLens offers a comprehensive museum exploration experience:

- **Museum Navigation**: Interactive floor plan with AI-powered route planning
- **Artifact Recognition**: QR code scanning to identify artifacts
- **3D Model Viewing**: Interactive 3D artifact models using Google Model Viewer
- **AI Chat**: Ask questions about artifacts - history, usage, craftsmanship, symbolism
- **Collection System**: Track your artifact collection progress by theme
- **Gift Shop**: Browse and purchase museum merchandise
- **Community**: Share and view posts from other visitors

## Technologies Used

### Frontend

- **Vue 3** - Progressive JavaScript framework with Composition API
- **Vite** - Next-generation frontend build tool
- **@google/model-viewer** - Web component for displaying 3D models
- **qr-scanner** - QR code scanning library
- **qrcode** - QR code generation library

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **OpenAI API** - AI-powered artifact knowledge assistant
- **Google Cloud Vision** - Image classification service

### Development Tools

- **ESLint** - JavaScript linting
- **Prettier** - Code formatting

## Data Handling

StoryLens manages user input and interaction states through a centralized state management system using Vue 3's Composition API.

### State Management Architecture

The application uses **reactive stores** to manage data:

| Store | File | Purpose |
|-------|------|---------|
| Museum Store | `frontend/src/museum/store.js` | Core application state (artifacts, points, collections) |
| Social Store | `frontend/src/museum/socialStore.js` | Social features (saved posts, interactions) |

### User Input Handling

#### 1. Form Inputs
User inputs are captured using Vue's `v-model` directive with reactive references:

```javascript
// Example from LoginView.vue
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
```

#### 2. Application State Persistence
The application persists user navigation state using `localStorage`:

```javascript
// Keys used for state persistence
const STORAGE_KEY_STAGE = "mq_stage"        // Current app stage (splash/login/app)
const STORAGE_KEY_CURRENT = "mq_current"    // Current active tab
const STORAGE_KEY_PREVIOUS_TAB = "mq_previous_tab"  // Previous tab for navigation
```

**Persistence Logic**:
- State is saved automatically when users switch tabs or stages
- On app reload, previous state is restored from localStorage
- Authentication status (`mq_authed`) and username (`mq_user`) are also persisted

#### 3. Artifact Collection State

```javascript
// Museum store tracks user progress
const state = reactive({
  points: 100,                          // User's reward points
  unlockedArtifactIds: ["horus-falcon-statue"],  // Collected artifacts
  redeemedShopIds: [],                  // Redeemed shop items
  artifacts: [...initialArtifacts],     // All available artifacts
  lastScan: null,                       // Most recent scan result
})
```

**Collection Mechanics**:
- First scan: Unlocks artifact, adds full points
- Revisit: Adds bonus points (+5)
- Points can be redeemed for shop items

#### 4. Social Interaction State

```javascript
// Social store manages saved posts
const state = reactive({
  savedPosts: [],  // Array of saved community posts
})

// Functions for managing interactions
- savePost(post)      // Add post to saved collection
- unsavePost(postId)  // Remove from saved
- isSaved(postId)     // Check if post is saved
```

#### 5. Chat Session Management

AI chat interactions maintain session state:

```javascript
// ScanView.vue chat state
const chatMessages = ref([])      // Message history
const chatSessionId = ref("")     // Unique session identifier
const chatArtifactId = ref("")    // Current artifact context
```

**Session Flow**:
1. User scans artifact QR code
2. System creates new chat session
3. Messages are streamed from backend (SSE/NDJSON)
4. Session persists while user stays on scan page

### Data Flow Examples

| Interaction | Input Type | State Update | Persistence |
|-------------|------------|--------------|-------------|
| QR Scan | Camera input | `unlockedArtifactIds`, `points` | In-memory (reactive) |
| Like Post | Button click | `post.liked`, `post.likes` | In-memory |
| Save Post | Button click | `savedPosts` array | In-memory |
| Redeem Item | Button click | `points`, `redeemedShopIds` | In-memory |
| Switch Tab | Navigation | `current`, `previousTab` | localStorage |
| Login | Form submit | `stage`, `mq_authed` | localStorage |
| AI Chat | Text input | `chatMessages` | Session-only |

### Error Handling

Input validation and error states are managed locally in components:

```javascript
// Example error state management
const scanError = ref("")      // QR scan errors
const chatError = ref("")      // Chat API errors
const cameraError = ref("")    // Camera permission errors
```

## Project Structure

```
CPT208/
├── frontend/                    # Vue.js frontend application
│   ├── src/                     # Source code
│   │   ├── views/               # Vue components for each page
│   │   │   ├── HomeView.vue      # Home page with museum map
│   │   │   ├── ScanView.vue      # QR scanning and 3D viewing
│   │   │   ├── CollectionView.vue # Artifact collection progress
│   │   │   ├── StoreView.vue     # Gift shop
│   │   │   ├── CommunityView.vue # Social community
│   │   │   ├── ProfileView.vue   # User profile
│   │   │   ├── LoginView.vue     # Login page
│   │   │   ├── RegisterView.vue  # Registration page
│   │   │   └── ForgotPasswordView.vue
│   │   ├── museum/              # State management
│   │   │   ├── store.js          # Core application state
│   │   │   └── socialStore.js    # Social features state
│   │   ├── utils/               # Utility functions
│   │   │   ├── api.js            # API client
│   │   │   ├── authApi.js        # Authentication API
│   │   │   └── amap.js           # Map integration
│   │   ├── data/                # Mock data
│   │   ├── assets/              # Static assets (images, icons)
│   │   ├── App.vue              # Root component
│   │   └── main.js              # Application entry point
│   ├── public/                  # Static files served directly
│   │   ├── models/              # 3D model files (.glb)
│   │   └── artifact-qrcodes/     # QR codes for artifacts
│   ├── docs/                    # API documentation
│   ├── scripts/                 # Utility scripts
│   ├── ai/                      # AI coding logs
│   │   ├── README.md            # Vibe coding methodology overview
│   │   └── logs/                # Prompts used for core components
│   ├── package.json             # Frontend dependencies
│   ├── package-lock.json        # Locked dependencies
│   ├── vite.config.js           # Vite configuration
│   ├── index.html               # HTML entry point
│   └── jsconfig.json            # JS configuration
├── backend/                     # Express.js backend
│   ├── api/                     # API endpoints
│   │   ├── agent/               # AI-related endpoints
│   │   │   ├── chat.js          # AI chat interface
│   │   │   └── classify-image.js # Image classification
│   │   └── health.js            # Health check endpoint
│   ├── lib/                     # Utility libraries
│   │   ├── agent-service.js     # AI agent service
│   │   └── vision-service.js    # Computer vision service
│   ├── data/                    # Data files
│   │   └── artifact_knowledge.json # Artifact knowledge base
│   ├── package.json             # Backend dependencies
│   ├── package-lock.json        # Locked dependencies
│   ├── index.js                 # Server entry point
│   ├── vercel.json              # Vercel deployment config
│   └── .env.example             # Environment variables template
├── .env.example                 # Root environment variables
├── .gitignore                   # Git ignore rules
├── entrypoint.sh                # Deployment script
└── README.md                    # Project documentation
```

## Setup Instructions

### Prerequisites

Before starting, ensure you have the following installed:

- Node.js (v18 or higher)
- npm (v9 or higher)

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd CPT208/frontend
```

1. Install frontend dependencies:

```bash
npm install
```

1. Create environment variables:

```bash
cp .env.example .env
```

1. Edit `.env` file and configure your API endpoints if needed:

```
VITE_API_BASE=http://localhost:8787
```

### Backend Setup

1. Navigate to the backend directory:

```bash
cd CPT208/backend
```

1. Install backend dependencies:

```bash
npm install
```

1. Create environment variables:

```bash
cp .env.example .env
```

1. Edit `.env` file and add your API keys:

```
PORT=8787
OPENAI_API_KEY=your_openai_api_key
GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key
```

## Running the Application

### Development Mode

**Start the backend server:**

```bash
cd CPT208/backend
npm start
```

**Start the frontend development server:**

```bash
cd CPT208/frontend
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Mode

**Build the frontend:**

```bash
cd CPT208/frontend
npm run build
```

**Run the production server:**

```bash
npm run preview
```

### Generate QR Codes

To generate QR codes for artifacts:

```bash
cd CPT208/frontend
npm run generate:qrcodes
```

## API Documentation

For detailed API documentation, see [frontend/docs/auth-api.md](frontend/docs/auth-api.md)

Notice: Login & Register APIs are designed for next iteration, not completed yet!

### Key API Endpoints

| Endpoint                          | Method | Description                              |
| --------------------------------- | ------ | ---------------------------------------- |
| `/api/agent/chat`                 | POST   | AI chat interface for artifact questions |
| `/api/agent/classify-image`       | POST   | Image classification for artifacts       |
| `/api/auth/register`              | POST   | User registration                        |
| `/api/auth/login`                 | POST   | User login                               |
| `/api/auth/password/request-code` | POST   | Request password reset code              |
| `/api/auth/password/reset`        | POST   | Reset password                           |

## License

This project is for educational purposes as part of the CPT208 course.