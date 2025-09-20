# RAG Chatbot with Gemini 2.0 Flash

This is a Retrieval-Augmented Generation (RAG) system that uses Google's Gemini 2.0 Flash model to provide intelligent, context-aware responses based on your uploaded documents.

## Features

- **Document Processing**: Upload text files and automatically generate embeddings
- **Intelligent Responses**: Uses Gemini 2.0 Flash to generate contextual, helpful answers
- **Vector Database**: ChromaDB for efficient similarity search
- **RESTful API**: Flask backend with CORS support
- **Error Handling**: Comprehensive error handling and logging

## Prerequisites

- Python 3.8+
- Google AI Studio API key (for Gemini 2.0 Flash)
- Internet connection for API calls

## Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure API Key**:
   - Create a `.env` file in the backend directory
   - Add your Google AI Studio API key:
     ```
     api_key=your_google_ai_studio_api_key_here
     ```

3. **Test Integration**:
   ```bash
   python test_gemini.py
   ```

## Usage

### Starting the Server

```bash
python app.py
```

The server will start on `http://localhost:5000`

### API Endpoints

#### 1. Upload Documents
- **POST** `/upload`
- **Body**: Form data with file
- **Response**: JSON with processing status and embedding count

#### 2. Chat with Documents
- **POST** `/chat`
- **Body**: JSON with question
- **Response**: JSON with Gemini-generated answer

#### 3. Health Check
- **GET** `/health`
- **Response**: Service status and available endpoints

### Example Usage

#### Upload a Document
```bash
curl -X POST -F "file=@your_document.txt" http://localhost:5000/upload
```

#### Ask a Question
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"question":"What is the main topic of the uploaded documents?"}' \
  http://localhost:5000/chat
```

## How It Works

1. **Server Start**:
   - Automatically clears all previous embeddings and uploads
   - Creates fresh ChromaDB database and collection
   - Ensures clean slate for each session

2. **Document Processing**:
   - Files are split into sentences
   - Each sentence is embedded using Google's embedding model
   - Embeddings are stored in ChromaDB

3. **Question Answering**:
   - User question is embedded
   - Similar sentences are retrieved from ChromaDB
   - Context is sent to Gemini 2.0 Flash
   - Gemini generates a comprehensive, contextual response

## Model Information

- **Chat Model**: Gemini 2.0 Flash (Experimental)
- **Embedding Model**: Google's embedding-001
- **Vector Database**: ChromaDB with persistent storage

## Error Handling

The system includes comprehensive error handling:
- API key validation
- File upload validation
- Gemini API error fallbacks
- Detailed logging for debugging

## Troubleshooting

1. **API Key Issues**: Ensure your Google AI Studio API key is valid and has access to Gemini 2.0 Flash
2. **Model Access**: Gemini 2.0 Flash is experimental - ensure you have access in your region
3. **Rate Limits**: Be aware of Google's API rate limits
4. **File Formats**: Currently supports text files (.txt)

## Performance Notes

- Gemini 2.0 Flash provides fast, high-quality responses
- Embedding generation may take time for large documents
- ChromaDB provides efficient similarity search
- Consider document size limits for optimal performance

## Security

- API key is stored in environment variables
- CORS is enabled for frontend integration
- Input validation on all endpoints
- No sensitive data logging

## Future Enhancements

- Support for more file formats (PDF, DOCX)
- Batch processing for multiple documents
- Conversation history tracking
- Custom prompt templates
- Response streaming
