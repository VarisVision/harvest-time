# Harvest Time Tracker

## Introduction

Harvest Time Tracker is a streamlined time entry application that integrates with your Harvest account. It provides a simple, intuitive interface for logging time entries directly from your browser. Content creators, developers, and team members can quickly track their work hours with project and task selection, without the need to navigate through the full Harvest interface. The app keeps your most-used projects and tasks readily accessible while minimizing context switching.

## Features and Benefits

**Quick Time Entry** - Log time entries with project, task, hours, date, and optional notes in one streamlined form

**Smart Project & Task Selection** - Searchable dropdowns with automatic filtering to quickly find your projects and tasks

**Flexible Time Format** - Enter hours in decimal format (2.5) or time format (2:30) for your convenience

**Persistent Preferences** - Automatically remembers your last selected project and task for faster repeat entries

**OAuth Authentication** - Secure integration with Harvest using OAuth 2.0

**Modern UI** - Clean, responsive interface built with React and Chakra UI

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js** (version 20 or higher recommended)
- **npm** or **yarn** package manager
- **Harvest Account** with API access
- **Harvest OAuth Application** credentials (Client ID and Client Secret)

### Setting Up Harvest OAuth Application

1. Log in to your Harvest account
2. Navigate to **Settings** > **Integrations** > **Authorized OAuth2 Applications**
3. Create a new OAuth2 application
4. Set your redirect URI (e.g., `http://localhost:3000/api/auth/callback` for development)
5. Copy your **Client ID** and **Client Secret**

### Installation Process

1. Clone or download this repository

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your Harvest credentials:

```bash
HARVEST_CLIENT_ID=your_client_id_here
HARVEST_CLIENT_SECRET=your_client_secret_here
HARVEST_REDIRECT_URI=http://localhost:3000/api/auth/callback
HARVEST_ACCOUNT_ID=your_harvest_account_id
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

6. Click the login button to authenticate with Harvest

7. Once authenticated, you'll be redirected to the time entry form where you can start logging your hours

## Software Dependencies

This project requires:

- **Node.js** (version 20 or higher recommended)
- **npm** or **yarn** package manager
- **Next.js** 15.5.2 - React framework for production
- **React** 19.1.0 - JavaScript library for building user interfaces
- **Chakra UI** - Component library for the UI
- **Material-UI Date Pickers** - Date selection component
- **Harvest API** - Integration with Harvest time tracking service

### Installing Dependencies

```bash
npm install
```

## Running in Development Mode

To run the project in development mode with hot reload:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Building for Production

To create a production build:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## How to Use

1. **Select a Project** - Use the searchable dropdown to find and select your project. Projects are organized by client name
2. **Choose a Task** - Select the appropriate task for your time entry from the filtered task list
3. **Enter Hours** - Input your time in either decimal format (e.g., 2.5) or time format (e.g., 2:30)
4. **Pick a Date** - Select the date for your time entry using the calendar picker
5. **Add Notes** (Optional) - Include any relevant details or descriptions about your work
6. **Save** - Click "Save Time Entry" to submit your time log to Harvest

## API References

This project integrates with the **Harvest API** for time tracking functionality:

- [Harvest API Documentation](https://help.getharvest.com/api-v2/)
- [Harvest OAuth 2.0 Guide](https://help.getharvest.com/api-v2/authentication-api/authentication/authentication/)

**Authentication Issues**
- Verify your OAuth credentials are correct in `.env.local`
- Ensure the redirect URI matches exactly what's configured in your Harvest OAuth application
- Check that your Harvest account has API access enabled

**Time Entry Failures**
- Confirm you have permission to log time to the selected project
- Verify the project and task are still active in Harvest
- Check that the date is within the allowed timeframe for your account

**Loading Issues**
- Clear your browser cache and cookies
- Check the browser console for any error messages
- Ensure all dependencies are installed correctly