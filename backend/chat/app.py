# app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add the parent directory to the Python path so we can import process_file
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from process_file import process_file, query_rag, clear_all_embeddings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

def clear_uploads_folder():
    """Clear all files from the uploads folder on server start"""
    try:
        import shutil
        # Remove all files in uploads folder
        for filename in os.listdir(UPLOAD_FOLDER):
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            if os.path.isfile(file_path):
                os.unlink(file_path)
                logger.info(f"🗑️  Removed uploaded file: {filename}")
        logger.info("✨ Uploads folder cleared successfully")
    except Exception as e:
        logger.warning(f"⚠️  Could not clear uploads folder: {e}")

# Clear uploads folder on server start
clear_uploads_folder()

# Clear embeddings on server start (but handle errors gracefully)
try:
    clear_all_embeddings()
    logger.info("✅ Embeddings cleared successfully on startup")
except Exception as e:
    logger.warning(f"⚠️  Could not clear embeddings on startup: {e}")
    logger.info("Continuing with existing embeddings...")

@app.route("/upload", methods=["POST"])
def upload_file():
    try:
        if "files" not in request.files:
            return jsonify({"error": "No files uploaded"}), 400
        
        files = request.files.getlist("files")
        if not files or files[0].filename == "":
            return jsonify({"error": "No files selected"}), 400
        
        uploaded_files = []
        total_embeddings = 0
        
        for file in files:
            if file.filename:
                filepath = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
                file.save(filepath)
                
                logger.info(f"Processing file: {file.filename}")
                embeddings_count = process_file(filepath)
                total_embeddings += embeddings_count
                
                uploaded_files.append({
                    "filename": file.filename,
                    "embeddings_count": embeddings_count
                })
        
        return jsonify({
            "message": f"Successfully processed {len(uploaded_files)} file(s)",
            "files": uploaded_files,
            "total_embeddings": total_embeddings
        })
    
    except Exception as e:
        logger.error(f"Error processing files: {str(e)}")
        return jsonify({"error": f"Error processing files: {str(e)}"}), 500

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        question = data.get("question")
        if not question:
            return jsonify({"error": "No question provided"}), 400
        
        logger.info(f"Processing question: {question}")
        answer = query_rag(question)
        
        # Determine the source of the answer
        # Check if we have any embeddings in the collection
        try:
            from process_file import collection
            stored_data = collection.get()
            has_embeddings = len(stored_data["ids"]) > 0
            source = "uploaded documents + Gemini knowledge" if has_embeddings else "Gemini knowledge only"
        except:
            source = "Gemini knowledge only"
        
        return jsonify({
            "answer": answer,
            "question": question,
            "model": "Gemini 2.0 Flash",
            "source": source
        })
    
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({"error": f"Error processing question: {str(e)}"}), 500

@app.route("/clear-embeddings", methods=["POST"])
def clear_embeddings():
    """Clear all embeddings from the database"""
    try:
        clear_all_embeddings()
        logger.info("Embeddings cleared successfully")
        return jsonify({
            "message": "All embeddings cleared successfully",
            "status": "cleared"
        })
    except Exception as e:
        logger.error(f"Error clearing embeddings: {str(e)}")
        return jsonify({"error": f"Error clearing embeddings: {str(e)}"}), 500

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint to verify the service is running"""
    return jsonify({
        "status": "healthy",
        "service": "RAG Chatbot with Gemini 2.0 Flash",
        "endpoints": ["/upload", "/chat", "/health", "/clear-embeddings"]
    })

if __name__ == "__main__":
    logger.info("Starting RAG Chatbot with Gemini 2.0 Flash...")
    app.run(host="0.0.0.0", port=5000, debug=True)
