# Week of Years Portal

A modern, clean web application for tracking weekly tasks and projects across multiple clients, organized into Content and Music categories.

## Features

- **📅 Dynamic Week Management**: Automatically displays weeks across years without manual resets
- **🎨 Color-Coded Labels**: Create custom labels with colors for easy visual organization
- **🏷️ Categorized Labels**: Labels are organized into Content and Music categories
- **📝 Week Notes**: Add notes to individual weeks for detailed tracking
- **🔄 Auto-Scroll**: Automatically scrolls to the current week on load
- **📊 Side-by-Side View**: Content and Music tables displayed next to each other
- **🎯 Floating Label Manager**: Access label management from anywhere with a floating button
- **✨ Modern UI**: Clean, light design with smooth interactions
- **💾 JSON Database**: Simple file-based storage for easy data management

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Managing Labels

- Click the **+** button in the Labels sidebar to add a new label
- Each label has a name and color
- Edit or delete labels using the icons that appear on hover

### Managing Clients

- Click **Add Row** to add a new client to either Content or Music tables
- Select a label to associate with the client
- Delete clients using the trash icon that appears on hover

### Working with Weeks

- Click any week box to:
  - Change the color (select from your labels)
  - Add or edit notes
  - Clear the color
- Current week is highlighted with a blue border
- Week boxes show a blue dot indicator when they have notes

### Navigation

- Use **Jump to Week** button to scroll back to the current week
- Weeks automatically display across year boundaries (e.g., week 52, 2024 → week 1, 2025)
- The app displays 20 weeks: 10 before and 10 after the current week
- Content and Music tables are displayed **side-by-side** for easy comparison

## Project Structure

```
├── data/
│   └── database.json          # JSON file storing all app data
├── src/
│   ├── app/
│   │   ├── api/              # API routes for data management
│   │   │   ├── data/         # GET all data
│   │   │   ├── week/         # Update week colors and notes
│   │   │   ├── client/       # Add/delete clients
│   │   │   └── label/        # Manage labels
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Main portal page
│   ├── components/
│   │   ├── WeekBox.tsx              # Individual week component
│   │   ├── ClientRow.tsx            # Client row with weeks
│   │   ├── FloatingLabelManager.tsx # Floating label management panel
│   │   └── AddClientButton.tsx      # Add client button with label filter
│   ├── types/
│   │   └── index.ts          # TypeScript definitions
│   └── utils/
│       └── weekUtils.ts      # Week calculation utilities
```

## Data Structure

The app uses a JSON file (`data/database.json`) with the following structure:

```json
{
  "labels": [
    { "id": "1", "name": "HEMA", "color": "#86efac", "category": "content" }
  ],
  "tables": {
    "content": {
      "clients": [
        {
          "id": "c1",
          "name": "Client Name",
          "labelId": "1",
          "weeks": {
            "2024-47": { "color": "#86efac", "note": "Note text" }
          }
        }
      ]
    },
    "music": {
      "clients": []
    }
  }
}
```

## Technologies

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Node.js File System** - JSON database

## Future Enhancements

- Export data to CSV/Excel
- Filtering and search functionality
- Multi-user support with authentication
- Database migration (PostgreSQL, MongoDB)
- Week range customization
- Bulk operations
- Undo/redo functionality
