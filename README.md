# Todo App - Event Management

A React Native todo/event management app built with Expo, featuring daily event tracking and historical progress viewing.

## Features

### 1. Create Events
- Add new events with title, description, date, and priority
- Priority levels: Low, Medium, High
- Date picker for scheduling events

### 2. Today's Events
- View all events scheduled for today
- Check off completed events
- Real-time progress tracking showing completion percentage
- Visual progress bar
- Delete events with swipe
- Priority color coding (red/yellow/green)

### 3. Event History
- View past events organized by date
- See completion rate for each day
- Overall statistics: total days, total events, average completion rate
- Expandable daily view to see individual events
- Visual progress indicators

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **NativeWind** (Tailwind CSS) for styling
- **Drizzle ORM** for database management
- **Expo SQLite** for local data storage
- **Zustand** for state management
- **Expo Router** for navigation

## Project Structure

```
app/
├── (tabs)/
│   ├── index.tsx          # Today's events screen
│   ├── two.tsx            # History screen
│   └── _layout.tsx        # Tab navigation
├── create-event.tsx       # Create event modal
└── _layout.tsx            # Root layout

src/
├── db/
│   ├── schema.ts          # Database schema
│   ├── client.ts          # Database client
│   └── services.ts        # Database operations
└── stores/
    └── todo-store.ts      # State management
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run android  # For Android
   npm run ios      # For iOS
   npm run web      # For Web
   ```

## Database Schema

### Events Table
- `id`: Unique identifier
- `title`: Event title (required)
- `description`: Event description (optional)
- `completed`: Boolean completion status
- `date`: Event date timestamp
- `priority`: Low, Medium, or High
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## Key Features Implementation

### Today's Events Screen
- Displays events for the current day
- Shows completion progress with percentage and visual bar
- Quick toggle for marking events complete
- Pull-to-refresh for updating data
- Floating action button to create new events

### History Screen
- Groups events by date
- Calculates and displays completion percentage per day
- Shows overall statistics across all days
- Expandable/collapsible date sections
- Color-coded progress indicators

### Create Event Modal
- Simple form for creating new events
- Date picker for scheduling
- Priority selector with visual feedback
- Form validation

## Styling

The app uses NativeWind (Tailwind CSS) for consistent, utility-first styling with:
- Dark mode support
- Responsive design
- Custom color scheme
- Smooth animations and transitions
