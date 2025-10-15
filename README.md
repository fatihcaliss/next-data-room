# Harvey: Data Room

A modern, secure document management and sharing platform built with Next.js, Supabase, and TypeScript.

## Features

- 🔐 **Authentication**: Secure user authentication with Supabase Auth
- 📁 **Folder Management**: Create, rename, delete, and navigate nested folders
- 📄 **PDF Upload**: Upload and manage PDF files with 10MB size limit
- 🔗 **Share Links**: Generate shareable links for folders
- ⌨️ **Keyboard Shortcuts**: Quick actions with Cmd+/ (new folder) and Cmd+. (upload)
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🌙 **Dark Theme**: Modern dark UI matching the design requirements

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase (Database + Storage + Auth)
- **State Management**: React Query (@tanstack/react-query)
- **Icons**: Lucide React

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
-- Copy and paste the contents of supabase-schema.sql
```

4. Create a storage bucket named `documents` in your Supabase dashboard
5. Get your project URL and anon key from Settings > API

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

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Authentication
- Sign up with your email and password
- Sign in to access your data room
- Sign out when done

### Folder Management
- Click "New Folder" or use Cmd+/ to create folders
- Right-click folders to rename, delete, or copy share links
- Navigate by clicking on folder names or using breadcrumbs

### File Management
- Click "Upload PDFs" or use Cmd+. to upload files
- Only PDF files under 10MB are allowed
- Right-click files to download or delete
- Files open in a new tab when clicked

### Sharing
- Use the "Copy Share Link" option on folders
- Share links allow others to view folder contents
- Links are public - use with caution

## Database Schema

The application uses two main tables:

- **folders**: Stores folder hierarchy with parent-child relationships
- **files**: Stores file metadata linked to folders and users

Row Level Security (RLS) ensures users can only access their own data.

## File Structure

```
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (dashboard)/     # Main application pages
│   └── layout.tsx       # Root layout with providers
├── components/
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard layout components
│   ├── dataroom/        # Data room specific components
│   ├── files/           # File management components
│   ├── folders/         # Folder management components
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── actions/         # Server actions for database operations
│   ├── queries/         # React Query hooks
│   ├── supabase/        # Supabase client configuration
│   ├── types.ts         # TypeScript type definitions
│   └── utils/           # Utility functions
└── hooks/               # Custom React hooks
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.