# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common Commands

### Development
```powershell
# Install dependencies (first time setup)
npm install

# Start development server (runs on localhost:3001)
npm run dev

# Build for production
npm run build

# Build for development environment
npm run build:dev

# Preview production build locally
npm run preview

# Run i18n translation tool (convert JSON to Excel and back)
npm run translate
```

### Translation Tool Usage
The project includes a custom translation tool (`scripts/translation_tool.js`) for managing i18n:
- Converts JSON locale files to Excel for easier translation management
- Converts Excel back to JSON for use in the application
- Locale files are in `i18n/locales/` (zh.json, en.json)

## Architecture Overview

### Tech Stack
- **Framework**: Nuxt 3 (SSR disabled - pure client-side rendering)
- **UI Library**: Element Plus (按需引入)
- **Styling**: Tailwind CSS with custom color scheme
- **Internationalization**: vue-i18n (supports zh/en)
- **Real-time Communication**: WebRTC + WebSocket (STOMP protocol)
- **HTTP Client**: Nuxt's $fetch with custom encryption layer
- **Rich Text Editor**: wangeditor
- **Canvas Drawing**: Fabric.js
- **Video/Screen Sharing**: PeerJS and custom WebRTC implementation

### Project Structure
```
app/
├── api/              # API definitions (auth.ts)
├── components/       # Vue components (no path prefix)
├── composables/      # Reusable composition functions
│   ├── api/         # API layer composables (useHttp.ts, etc.)
│   └── useWebRTC.ts, usePeerJS.ts, etc. - Real-time communication
├── layouts/         # Layout components (auth, default, sidebar, blank)
├── pages/           # File-based routing
│   ├── city/       # City admin routes
│   ├── lessons/    # Lesson management
│   ├── school/     # School admin routes
│   ├── student/    # Student interface
│   └── system/     # System routes
├── plugins/        # Nuxt plugins
│   ├── element-plus.ts      # Element Plus registration
│   ├── fetch-interceptor.ts # Global fetch interceptor
│   └── i18n.ts             # i18n configuration
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
    ├── crypto.ts   # AES encryption utilities
    └── jsencrypt.ts # RSA encryption for API security

i18n/locales/       # Translation files (zh.json, en.json)
scripts/            # Build and utility scripts
public/             # Static assets
dist/               # Build output (custom location, not .output)
```

### Key Architectural Patterns

#### Authentication & Security
- **Token-based auth**: JWT tokens stored in localStorage with "Bearer" prefix
- **RSA + AES Hybrid Encryption**: 
  - RSA public key encrypts randomly generated AES key
  - AES key encrypts request body
  - Encrypted AES key sent via `encrypt-key` header
  - Implementation in `app/composables/api/useHttp.ts` and `app/utils/crypto.ts`
- **Login types**: Username/password, phone verification, class code (for students)
- **Auto-redirect**: 401/403 errors automatically redirect to login after 2 seconds

#### HTTP Request Layer (`useHttp`)
Located in `app/composables/api/useHttp.ts`:
- Wraps Nuxt's $fetch with custom interceptors
- Automatic token injection from localStorage
- Language header injection (`Content-Language`: zh_CN or en_US)
- Optional request encryption (controlled by `isEncrypt` header)
- Global error handling with ElMessage
- Methods: `get()`, `post()`, `put()`, `del()`, `patch()`

#### Real-time Communication Architecture
The app supports **screen sharing and video conferencing** with dual implementations:

1. **Custom WebRTC** (`useWebRTC.ts` + `useStompSignaling.ts`):
   - STOMP protocol over WebSocket for signaling
   - Token passed via WebSocket `connectHeaders: { Authorization: Bearer ${token} }`
   - Teacher pushes screen share, students receive
   - Subscription pattern: `/topic/room/{roomId}`, send to `/app/room/{roomId}`
   - ICE servers: Google STUN servers (stun.l.google.com)

2. **PeerJS Alternative** (`usePeerJS.ts` + `usePeerScreenShare.ts`):
   - Simplified P2P using PeerJS library
   - Fallback option for WebRTC

**Role-based flow**:
- Teacher starts screen share → broadcasts "screen-share-start"
- Students receive notification → request offer
- Teacher sends WebRTC offer → Student answers
- ICE candidates exchanged → P2P connection established

#### Environment Configuration
All environment-specific values in `nuxt.config.ts`:
- `apiBaseUrl`: Backend API gateway (default: test-gateway.matatastudio.com)
- `previewBaseUrl`: Preview service for content
- `signalingUrl`: WebSocket URL for WebRTC signaling
- Switches between dev/prod based on `NODE_ENV`
- **Note**: Both dev and prod currently point to test gateway

#### Internationalization
- Languages: Chinese (zh) and English (en)
- Locale stored in localStorage, default is 'zh'
- Automatic language header injection in all API requests
- Translation files: `i18n/locales/zh.json`, `i18n/locales/en.json`
- Use `npm run translate` to convert between JSON ↔ Excel for easier translation management

#### Component Registration
- Components in `app/components/` are auto-imported **without path prefix**
- Example: `LoginModal.vue` used as `<LoginModal />` (not `<ComponentsLoginModal />`)
- Element Plus components selectively registered in `app/plugins/element-plus.ts`

#### Build Output
- Custom output directory: `dist/` (not default `.output/`)
- Configured via `nitro.output` in nuxt.config.ts
- SSR disabled (`ssr: false`) - fully client-side application

### Important Code Patterns

#### Making Authenticated API Requests
```typescript
// Import useHttp composable
import { useHttp } from '~/composables/api/useHttp'

// Standard request
const http = useHttp()
const data = await http.get('/api/resource')

// With encryption (for sensitive data like login)
const response = await http.post('/auth/login', 
  { username, password },
  { isEncrypt: 'true' }  // Triggers RSA+AES encryption
)
```

#### WebRTC Screen Sharing (Teacher)
```typescript
import { useWebRTC } from '~/composables/useWebRTC'

const webrtc = useWebRTC()
webrtc.initialize({
  signalingUrl: config.public.signalingUrl,
  roomId: classroomId,
  userId: teacherId,
  role: 'teacher',
  onPeerConnected: (peerId) => console.log('Student connected')
})

await webrtc.startScreenShare()
```

#### Internationalization
```vue
<template>
  <div>{{ $t('login.title') }}</div>
</template>

<script setup>
// Change language
const changeLanguage = (locale) => {
  localStorage.setItem('locale', locale)
  // Reload or use i18n.global.locale
}
</script>
```

## Default User Accounts
From README.md:
- Super Admin: `admin` / `admin123`
- Teacher: `teacher[000001]` / `123456`

## Development Notes

### Windows-Specific Commands
The build scripts use Windows-style environment variable setting:
- `set NODE_ENV=production&& nuxt build` (note: no space before &&)

### WebSocket Connection
- Ensure token is in localStorage before connecting to WebSocket
- Token is sent via `Authorization` header in STOMP `connectHeaders`
- Connection logs can be found with `[STOMP]` and `[WebRTC]` prefixes

### Tailwind CSS
- Custom colors defined: `primary` (#FF9900), `blue` (#3366FF), `orange` (#FFA54D)
- Extensive safelist for dynamic classes (see `tailwind.config.js`)
- Custom breakpoint `3xl` at 1400px for 1200-1500px screens

### TypeScript
- Type definitions in `app/types/`
- API response types defined alongside API functions (e.g., `app/api/auth.ts`)

### Debugging
- Look for console logs prefixed with `[STOMP]`, `[WebRTC]`, and `🔐` (encryption)
- WebRTC connection states logged automatically
- Request encryption details logged when encryption is enabled
