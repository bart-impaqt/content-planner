# Firebase Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "week-of-years-portal")
4. Follow the setup wizard (you can disable Google Analytics if not needed)

## Step 2: Create Firestore Database

1. In your Firebase project, go to "Build" → "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode" (we'll set rules next)
4. Select a location closest to you (e.g., europe-west1)

## Step 3: Configure Firestore Security Rules

Go to the "Rules" tab and replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /weekOfYears/{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Note:** These rules allow anyone to read/write. For production, implement proper authentication.

## Step 4: Get Firebase Configuration

1. Go to Project Settings (gear icon) → "General"
2. Scroll to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register your app (name: "Week of Years Portal")
5. Copy the Firebase configuration object

## Step 5: Update Environment Variables

Open `.env.local` and replace with your Firebase config values:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Step 6: Migrate Existing Data

Run the migration script to copy your local data to Firebase:

```bash
node scripts/migrate-to-firebase.js
```

You should see confirmation that your data was uploaded.

## Step 7: Test the Application

```bash
npm run dev
```

The app now uses Firebase! All changes are automatically synced across devices.

## Year Rollover

The app automatically handles year transitions:

- Week keys use format: `YYYY-WW` (e.g., `2025-52`, `2026-01`)
- When generating weeks, it automatically increments the year when passing week 52
- No manual intervention needed when the calendar year changes

## Data Structure in Firebase

Collection: `weekOfYears`
Document: `main`

```json
{
  "labels": [...],
  "tables": {
    "content": { "clients": [...] },
    "music": { "clients": [...] }
  }
}
```

## Backup Data

To backup your Firebase data locally:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Export data
firebase firestore:export backup/
```

## Troubleshooting

- **Cannot connect to Firebase:** Check your `.env.local` values
- **Permission denied:** Verify Firestore security rules allow access
- **Data not appearing:** Check browser console for errors
- **Migration fails:** Ensure Firebase config is correct in `.env.local`
