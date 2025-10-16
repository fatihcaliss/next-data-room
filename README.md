# Acme: Data Room

A modern, secure document management and sharing platform built with Next.js, Supabase, and TypeScript.

👉 [Live Demo](https://next-data-room.vercel.app/)

## Features

- 🔐 **Authentication**: Secure user authentication with Supabase Auth
- 📁 **Folder Management**: Create, rename, delete, and navigate nested folders
- 📄 **PDF Upload**: Upload and manage PDF files with 10MB size limit
- 🎯 **Drag & Drop Upload**: Drag and drop PDF files directly into the upload dialog
- 🔍 **Duplicate Detection**: Automatic detection of duplicate file names with skip option
- ☑️ **Bulk Selection**: Select multiple files and folders with checkboxes
- 🗑️ **Bulk Delete**: Delete multiple items at once with a single action
- 🔗 **Public Folder Sharing**: Generate unique shareable links for folders with read-only access
- 👀 **Read-Only View**: Public users can view shared folders without authentication
- 🔒 **Secure Tokens**: 64-character unique tokens for each share link
- ⌨️ **Keyboard Shortcuts**: Quick actions with Cmd+/ (new folder) and Cmd+. (upload)
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 15 (App Router with Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Backend**: Supabase (Database + Storage + Auth)
- **State Management**: React Query (@tanstack/react-query)
- **Icons**: Lucide React
- **Date Formatting**: date-fns
- **Notifications**: Sonner

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd next-data-room
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project's SQL Editor
3. Run the SQL schema from `supabase-schema.sql`:

```sql
-- Copy and paste the entire contents of supabase-schema.sql
-- This will create tables, RLS policies, and indexes
```

4. Create a storage bucket named `documents` in your Supabase dashboard:
   - Go to Storage in your Supabase dashboard
   - Create a new bucket called `documents`
   - Make it private (not public)
5. Get your project URL and anon key from Settings > API

**Note**: The schema includes Row Level Security (RLS) policies, storage policies, helper functions, and the `shared_links` table for secure folder sharing functionality.

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the Development Server

```bash
npm run dev
```

This will start the development server with Turbopack enabled for faster builds.

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Authentication

- Sign up with your email and password
- Sign in to access your data room
- Sign out when done

### Folder Management

- Click "New Folder" or use Cmd+/ to create folders
- Navigate by clicking on folder names or using breadcrumbs

### File Management

- Click "Upload PDFs" or use Cmd+. to upload files
- Drag and drop PDF files directly into the upload dialog
- Only PDF files under 10MB are allowed
- Automatic duplicate file detection with option to skip
- Row acitons button has features to download or delete,copy link
- Files open in a new tab when clicked

### Bulk Operations

- Use checkboxes to select multiple files and folders
- Select all items with the header checkbox
- Delete multiple items at once with the "Delete All" button
- Clear selection at any time

### Sharing

- Click the share button on any folder to generate a public link
- Share links are unique tokens that never expire (by default)
- Anyone with the link can view folder contents in read-only mode
- No authentication required for accessing shared links
- Navigate through subfolders within the shared view
- Public users can only view - no editing or uploading

## Database Schema

The application uses three main tables:

- **folders**: Stores folder hierarchy with parent-child relationships
- **files**: Stores file metadata linked to folders and users
- **shared_links**: Stores unique tokens for public folder sharing

Helper Functions:

- **has_valid_shared_link()**: Checks if a folder has valid shared links for RLS policies
- **get_user_email()**: Safely retrieves user email by user ID

Row Level Security (RLS) ensures:

- Users can only access their own data when authenticated
- Public users can view shared folders through valid tokens (read-only)
- Shared folder access includes all subfolders and files
- Storage policies control file access based on ownership and shared links

## File Structure

```
├── app/
│   ├── (auth)/          # Authentication pages (login, signup)
│   ├── (dashboard)/     # Main application pages
│   ├── share/[token]/   # Public folder sharing pages
│   └── layout.tsx       # Root layout with providers
├── components/
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard layout components
│   ├── dataroom/        # Data room specific components
│   ├── files/           # File management components (upload, delete, rename)
│   ├── folders/         # Folder management components (create, delete, rename)
│   ├── providers/       # React Query and other providers
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── actions/         # Server actions for database operations
│   │   ├── files.ts     # File actions
│   │   ├── folders.ts   # Folder actions
│   │   └── share.ts     # Share link actions
│   ├── queries/         # React Query hooks
│   ├── supabase/        # Supabase client configuration
│   ├── types.ts         # TypeScript type definitions
│   └── utils/           # Utility functions
└── hooks/               # Custom React hooks (keyboard shortcuts, mobile detection)
```

## License

This project is licensed under the MIT License.
