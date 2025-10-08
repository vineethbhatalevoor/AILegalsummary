# Legal Document Summarizer

## Overview

This is an AI-powered legal document summarization application that allows users to upload legal documents in various formats (PDF, DOCX, TXT) and receive AI-generated summaries in multiple languages (English, Hindi, Kannada). The application uses Google's Gemini AI (gemini-2.0-flash-exp model) to analyze and summarize documents, with a Flask backend serving both the API and frontend through templates. The app runs on port 5000 and includes features like dark mode, text-to-speech, and real-time error handling.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Technology Stack**: Vanilla JavaScript with HTML/CSS
- **UI Pattern**: Single-page application with dynamic content updates
- **Theme Support**: Light/dark mode theming using CSS custom properties
- **File Handling**: Client-side file validation and FormData API for uploads
- **Text-to-Speech**: Browser's Web Speech API for audio playback of summaries
- **Rationale**: Lightweight approach without framework overhead, suitable for a focused single-purpose application

### Backend Architecture
- **Framework**: Flask (Python web framework)
- **API Design**: RESTful endpoints for document processing
- **File Processing Pipeline**:
  1. File upload with security validation (secure_filename)
  2. Format-specific text extraction (PDF, DOCX, TXT)
  3. AI summarization via Google Gemini
  4. Response formatting and delivery
- **CORS Configuration**: Enabled for cross-origin requests
- **File Upload Limits**: 16MB maximum file size
- **Rationale**: Flask provides simplicity for a straightforward request-response workflow; modular extraction functions allow easy extension for additional file formats

### Document Processing
- **PDF Extraction**: PyPDF2 library for reading PDF content with None-check guards for unparseable pages
- **DOCX Extraction**: python-docx library for Word document parsing
- **TXT Extraction**: Native Python file handling with UTF-8 encoding
- **Error Handling**: Try-catch blocks with descriptive error messages and automatic file cleanup
- **Rationale**: Format-specific libraries provide robust extraction; separate functions maintain clean separation of concerns

### AI Integration
- **Service**: Google Gemini AI (google-genai SDK)
- **Authentication**: API key from environment variables
- **Multi-language Support**: Supports English, Hindi, and Kannada summaries
- **Rationale**: Gemini provides powerful summarization capabilities with built-in multilingual support; environment-based configuration keeps credentials secure

### Security Measures
- **File Validation**: Whitelist of allowed extensions (.pdf, .docx, .txt)
- **Filename Sanitization**: Werkzeug's secure_filename utility
- **Upload Directory**: Isolated uploads folder for file storage
- **Size Limits**: 16MB maximum to prevent resource exhaustion
- **Rationale**: Multiple layers of validation prevent common upload vulnerabilities

### UI/UX Design
- **Responsive Design**: Mobile-first approach with flexible layouts
- **Visual Feedback**: Loading states, error messages, and success indicators
- **Accessibility**: ARIA labels and semantic HTML
- **Theme System**: CSS custom properties for easy theming
- **Rationale**: Provides smooth user experience across devices with clear visual communication

## External Dependencies

### Third-Party Services
- **Google Gemini AI**: AI-powered document summarization and analysis
  - Requires: GEMINI_API_KEY environment variable
  - Used for: Text summarization in multiple languages

### Core Libraries
- **Flask 3.1.2**: Web framework for request handling and routing
- **flask-cors 4.0.0**: Cross-Origin Resource Sharing support
- **PyPDF2 3.0.1**: PDF text extraction with None-check guards
- **python-docx 1.2.0**: Word document (.docx) text extraction
- **google-genai 1.0.0**: Google Gemini AI integration (using gemini-2.0-flash-exp model)
- **Werkzeug 3.1.3**: WSGI utilities and secure filename handling
- **python-dotenv 1.1.1**: Environment variable management
- **sift-stack-py**: Additional stack utilities

### Browser APIs
- **Web Speech API**: Text-to-speech functionality for summary playback
- **FormData API**: File upload handling
- **Fetch API**: Asynchronous HTTP requests

### Environment Configuration
- **Required Variables**:
  - `GEMINI_API_KEY`: API key for Google Gemini AI service
- **File Storage**: Local filesystem (`uploads/` directory)

### Font Resources
- **Google Fonts**: Poppins font family for consistent typography