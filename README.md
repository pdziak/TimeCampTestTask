# TimeCamp Activity Fetcher

A desktop application built with Electron and React that allows you to fetch and view your TimeCamp activity data for any given date.

## Features

- 🔐 Secure API token authentication with localStorage persistence
- 📅 Date-based activity fetching from TimeCamp API
- ⏱️ Automatic time calculation and formatting (hours, minutes, seconds)
- 📊 Activity summary with total time and activity count
- 📋 Detailed activity list display
- 🎨 Modern, responsive UI
- ⚡ Fast development with Vite and hot module replacement

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- A TimeCamp API token ([Get your API token here](https://www.timecamp.com/))

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd TimeCampTestTask
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Development Mode

Run the application in development mode with hot reload:

```bash
npm run electron:dev
```

This will:
- Start the Vite dev server
- Compile Electron TypeScript files
- Launch the Electron app with DevTools enabled

### Production Build

Build the application for production:

```bash
npm run electron:build
```

This creates a distributable package in the `dist` directory.

### Preview Production Build

Test the production build locally:

```bash
npm run electron:preview
```

## How to Use

1. **Get your API Token**: 
   - Log in to your TimeCamp account
   - Navigate to Settings → API
   - Generate or copy your API token

2. **Enter API Token**:
   - Paste your TimeCamp API token in the "API Token" field
   - The token will be saved in localStorage for future use

3. **Select Date**:
   - Choose the date you want to view activities for (defaults to today)
   - Date format: YYYY-MM-DD

4. **Fetch Activities**:
   - Click the "Fetch Activity" button
   - Wait for the data to load

5. **View Results**:
   - See the total time spent and number of activities
   - Browse the detailed activity list

## Project Structure

```
TimeCampTestTask/
├── electron/              # Electron main process files
│   ├── main.ts           # Main Electron process
│   └── preload.ts        # Preload script
├── src/
│   ├── api/              # API integration
│   │   ├── api-config.ts # API configuration
│   │   └── timecamp.ts   # TimeCamp API client
│   ├── components/       # React components
│   │   ├── ActivityForm.tsx
│   │   ├── ActivityItem.tsx
│   │   ├── ActivityList.tsx
│   │   ├── ActivitySummary.tsx
│   │   ├── ErrorMessage.tsx
│   │   ├── InfoMessage.tsx
│   │   └── LoadingMessage.tsx
│   ├── App.tsx           # Main React component
│   └── main.tsx          # React entry point
├── dist-electron/        # Compiled Electron files
├── package.json
├── vite.config.ts        # Vite configuration
└── tsconfig.json         # TypeScript configuration
```

## API Configuration

The application uses the TimeCamp API endpoint:
- Base URL: `https://app.timecamp.com/third_party/api`
- Endpoint: `/activity`
- Authentication: Bearer token (API token)

For more information, see the [TimeCamp API Documentation](https://developer.timecamp.com/#/operations/get--activity).

## Technologies Used

- **Electron** - Desktop application framework
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **ESLint** - Code linting

## Available Scripts

- `npm run dev` - Start Vite dev server (web only)
- `npm run build` - Build for production (web only)
- `npm run electron:dev` - Run Electron app in development mode
- `npm run electron:build` - Build Electron app for production
- `npm run electron:preview` - Preview production build
- `npm run lint` - Run ESLint

## Notes

- The API token is stored in browser localStorage for convenience
- The application handles various time field formats from the TimeCamp API
- Time is calculated from `time_span`, `duration`, or `start_time`/`end_time` fields
- The app displays a user-friendly error message if the API request fails

## License

See LICENSE file for details.
