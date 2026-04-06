# AI Meeting Notes Summarizer

A comprehensive web application that uses AI to analyze meeting notes, extract insights, and provide interactive features for better meeting management.

## 🚀 Features

### ✅ Save & History
- Save past meetings to database
- View previous summaries with full details
- Delete / edit meeting titles
- Search through meeting history

### 📂 File Upload Support
- Upload .txt, .pdf, .docx files
- Automatic text extraction from various formats
- Support for large documents

### 📥 Export Options
- Download summary as PDF
- Download summary as DOCX
- Professional formatting with all meeting details

### 🔍 Search Feature
- Search inside past meetings by title or content
- Filter by keywords and topics
- Real-time search results

### 🤖 Chat with Meeting (AI-Powered)
- Ask questions about specific meetings
- Get AI-powered answers based on meeting content
- Examples: "What are the action items?", "Who is responsible for X?"

### 🧠 Smart Action Items
- Extract Task, Person, and Deadline from action items
- Enhanced parsing beyond simple "will/should" statements
- Example: "Rahul will deploy backend by Friday" → Task: Deploy backend, Person: Rahul, Deadline: Friday

### 👥 Speaker Detection
- Automatically identify different speakers in meetings
- Label speakers: "Rahul: …", "Kanan: …"
- Group content by speaker

### 🌍 Multi-language Support
- Detect primary language of meeting content
- Translate summaries to English
- Accept non-English input for processing

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini AI
- **File Processing**: PDF-parse, Mammoth (for DOCX)
- **Export**: jsPDF, docx libraries

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Google Gemini API key
- Supabase account (for database)

## 🔧 Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-meetingnotes-summariser
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## 🔑 API Keys Setup

### Google Gemini AI
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Replace the placeholder in `.env.local`:
   ```bash
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

**Note**: The current API key in `.env.local` is a placeholder. Replace it with a real API key to get actual AI processing. With the placeholder key, the app will use mock responses for demonstration purposes.

### Supabase (Optional - for full database features)
1. Create a project at [Supabase](https://supabase.com)
2. Get your project URL and API keys
3. Update `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

Without Supabase, the app runs in demo mode with local storage simulation. (generate a secret)
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

4. **Database Setup**

   Create these tables in your Supabase database:

   ```sql
   -- Meetings table
   CREATE TABLE meetings (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title TEXT NOT NULL,
     content TEXT NOT NULL,
     summary JSONB NOT NULL,
     user_id TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     file_name TEXT,
     file_type TEXT
   );

   -- Chat messages table
   CREATE TABLE chat_messages (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
     user_id TEXT NOT NULL,
     message TEXT NOT NULL,
     response TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable RLS (Row Level Security)
   ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
   ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

   -- Create policies
   CREATE POLICY "Users can view own meetings" ON meetings
     FOR SELECT USING (auth.uid()::text = user_id);

   CREATE POLICY "Users can insert own meetings" ON meetings
     FOR INSERT WITH CHECK (auth.uid()::text = user_id);

   CREATE POLICY "Users can update own meetings" ON meetings
     FOR UPDATE USING (auth.uid()::text = user_id);

   CREATE POLICY "Users can delete own meetings" ON meetings
     FOR DELETE USING (auth.uid()::text = user_id);

   CREATE POLICY "Users can view own chat messages" ON chat_messages
     FOR SELECT USING (auth.uid()::text = user_id);

   CREATE POLICY "Users can insert own chat messages" ON chat_messages
     FOR INSERT WITH CHECK (auth.uid()::text = user_id);
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Processing a Meeting

1. Go to the home page
2. Enter a meeting title
3. Upload a file (.txt, .pdf, .docx) or paste text
4. Click "Process Meeting"
5. View the AI-generated summary, keywords, action items, and speakers

### Using Chat Feature

1. After processing a meeting, click "💬 Chat with Meeting"
2. Ask questions like:
   - "What are the action items?"
   - "Who is responsible for the backend deployment?"
   - "What was decided about the deadline?"

### Managing History

1. Click "History" in the navigation
2. View all your saved meetings
3. Search through meetings
4. Edit meeting titles or delete meetings
5. Export meetings as PDF/DOCX

## 🔑 API Endpoints

- `POST /api/process` - Process meeting notes
- `GET /api/meetings` - Get user's meetings
- `DELETE /api/meetings` - Delete a meeting
- `PUT /api/meetings` - Update meeting title
- `POST /api/chat` - Chat with a meeting
- `POST /api/export` - Export meeting summary

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Google Gemini AI for powerful language processing
- Supabase for the database solution
- Next.js for the React framework
- Tailwind CSS for styling
   ```

2. **Set up OpenAI API key** (Required for AI features):
   - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a `.env.local` file in the project root
   - Add your API key:
     ```
     OPENAI_API_KEY=sk-your-actual-api-key-here
     ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Current Implementation

- ✅ Basic Next.js setup with TypeScript and Tailwind CSS
- ✅ Upload component for text input and file upload (text files only)
- ✅ AI-powered summarization (short and detailed)
- ✅ Keyword extraction
- ✅ Action items detection
- ✅ Key sentences highlighting
- ✅ Clean UI with results display

## Next Steps

To implement additional features:
- Add Supabase for database storage
- Implement user authentication with NextAuth
- Add support for audio/video file processing
- Create meeting history dashboard
- Add export functionality
- Implement search and filtering
- Add dark/light mode toggle
- Integrate with Zoom/Teams APIs

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI API (for summarization, etc.)
- **Database**: [To be determined, e.g., MongoDB, Supabase]
- **Authentication**: [To be implemented]

## Project Structure

- `app/`: Next.js app directory
- `components/`: Reusable React components
- `lib/`: Utility functions and configurations
- `api/`: API routes for backend logic

## Contributing

[Add contribution guidelines]

## License

[Add license]