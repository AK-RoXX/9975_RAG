from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import fitz  # PyMuPDF for PDFs
import docx
import pandas as pd
from process_file import process_file, query_rag  # ✅ Use your actual RAG functions

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ---- File extractors ----
def extract_text_from_pdf(file_path):
    text = ""
    with fitz.open(file_path) as pdf:
        for page in pdf:
            text += page.get_text()
    return text

def extract_text_from_docx(file_path):
    doc = docx.Document(file_path)
    return "\n".join([p.text for p in doc.paragraphs])

def extract_text_from_csv(file_path):
    df = pd.read_csv(file_path)
    return df.to_string(index=False)

# ---- Upload endpoint ----
@app.route('/upload', methods=['POST'])
def upload_files():
    if 'files' not in request.files:
        return jsonify({'error': 'No files uploaded'}), 400

    uploaded_files = request.files.getlist('files')
    all_texts = []

    for file in uploaded_files:
        filename = file.filename
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

        # Extract text
        if filename.endswith('.txt'):
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                text = f.read()
        elif filename.endswith('.pdf'):
            text = extract_text_from_pdf(file_path)
        elif filename.endswith('.docx'):
            text = extract_text_from_docx(file_path)
        elif filename.endswith('.csv'):
            text = extract_text_from_csv(file_path)
        else:
            text = f"[Unsupported file format: {filename}]"

        # Save extracted text to a temp .txt file for embedding
        txt_path = file_path + ".txt"
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write(text)

        # Process into ChromaDB
        num_chunks = process_file(txt_path)

        all_texts.append({
            "filename": filename,
            "content": text[:300] + ("..." if len(text) > 300 else ""),  # Preview
            "chunks_stored": num_chunks
        })

    return jsonify({'files': all_texts})

# ---- Chat endpoint ----
@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    question = data.get("question", "")

    if not question:
        return jsonify({"error": "No question provided"}), 400

    try:
        answer = query_rag(question)
        return jsonify({"answer": answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
