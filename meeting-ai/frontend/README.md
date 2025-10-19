# Meeting Summarizer Frontend

React frontend for the Meeting Summarizer & Action Tracker application.

## Features

- 🎤 **Audio Upload & Recording**: Support for audio file uploads and browser-based recording
- 📝 **Meeting Management**: Create, view, and manage meetings
- 🧠 **AI-Powered Summaries**: View AI-generated meeting summaries with key points, decisions, and risks
- ✅ **Action Tracking**: Full CRUD operations for action items with assignees and due dates
- 📊 **Export Options**: Export summaries as Markdown and action items as CSV
- 🎨 **Modern UI**: Built with React, TypeScript, Tailwind CSS, and shadcn/ui components

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **UI Components**: Custom components with Tailwind CSS
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   echo VITE_API_URL=http://localhost:8000 >> .env
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, etc.)
│   ├── TopBar.tsx      # Navigation header
│   ├── StatCard.tsx    # Statistics display
│   ├── UploadCard.tsx  # Audio file upload
│   ├── SummaryPanel.tsx # Meeting summary display
│   ├── ActionTable.tsx # Action items management
│   ├── ExportMenu.tsx  # Export functionality
│   └── Recorder.tsx    # Browser audio recording
├── pages/               # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   └── MeetingDetail.tsx # Meeting detail view
├── store/               # State management
│   └── useMeetingStore.ts # Zustand store
├── lib/                 # Utilities and API
│   ├── api.ts          # API client
│   └── utils.ts        # Utility functions
├── types/               # TypeScript type definitions
│   └── index.ts        # Main types
└── App.tsx              # Main app component
```

### Key Components

- **Dashboard**: Overview of all meetings with statistics
- **Meeting Detail**: Full meeting view with transcript, summary, and actions
- **Upload Card**: Drag & drop audio file upload
- **Action Table**: Editable action items with CRUD operations
- **Export Menu**: Download summaries and action items

## API Integration

The frontend communicates with the FastAPI backend through the `/api` client in `src/lib/api.ts`. All API calls are centralized here for easy maintenance.

## Styling

The application uses Tailwind CSS for styling with a custom color scheme defined in `tailwind.config.js`. Components follow a consistent design system with proper spacing, typography, and interactive states.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for new features
3. Ensure responsive design for mobile devices
4. Test with different audio file formats
5. Update documentation as needed
