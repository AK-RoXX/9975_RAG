import google.generativeai as genai
from nltk.tokenize import sent_tokenize
import nltk
import chromadb
import os
from env import api_key

# Ensure necessary tokenizers are downloaded
nltk.download('punkt')
nltk.download('punkt_tab')

# Configure API key
genai.configure(api_key=api_key)

# Initialize Gemini 2.0 Flash model
gemini_model = genai.GenerativeModel('gemini-2.0-flash-exp')

# Initialize Chroma client with absolute path
current_dir = os.path.dirname(os.path.abspath(__file__))
chroma_db_path = os.path.join(current_dir, "chroma_db_classroom")
chroma_client = chromadb.PersistentClient(path=chroma_db_path)

def get_or_create_collection():
    """Get or create the collection, ensuring it exists"""
    try:
        return chroma_client.get_collection(name="rag_example")
    except:
        return chroma_client.create_collection(name="rag_example")

# Initialize collection
collection = get_or_create_collection()

# Clear embeddings on module import (server start)
def clear_all_embeddings():
    """
    Clear all embeddings from ChromaDB collection.
    This ensures a fresh start each time the server runs.
    """
    try:
        # Delete the existing collection
        chroma_client.delete_collection(name="rag_example")
        print("🗑️  Cleared existing embeddings collection")
        
        # Recreate the collection
        global collection
        collection = get_or_create_collection()
        print("✨ Created fresh embeddings collection")
        
    except Exception as e:
        print(f"⚠️  Warning: Could not clear embeddings: {e}")
        # If deletion fails, just get the existing collection
        collection = get_or_create_collection()

# Note: clear_all_embeddings() is called when the Flask server starts, not on module import

def process_file(file_path):
    """
    Process and store embeddings from a text file into ChromaDB.
    """
    # Step 1: Read file
    with open(file_path, "r", encoding="utf-8") as file:
        text_data = file.read()

    # Step 2: Split into sentences
    sentences = sent_tokenize(text_data)

    # Step 3: Embed each sentence
    embedded_data_list = []
    for sentence in sentences:
        response = genai.embed_content(
            model="models/embedding-001",
            content=sentence
        )
        embedded_data_list.append({
            "text": sentence,
            "embedding": response["embedding"]
        })

    # Step 4: Store in ChromaDB
    for i, data in enumerate(embedded_data_list):
        collection.add(
            ids=[f"{file_path}-{i}"],  # Unique IDs
            embeddings=[data["embedding"]],
            metadatas=[{"text": data["text"]}]
        )

    stored_data = collection.get()
    return len(stored_data["ids"])

def query_rag(question, n_results=5):
    """
    Implement proper RAG: First search uploaded documents, then combine with Gemini's knowledge.
    Always provide comprehensive answers using both sources when available.
    """
    # Embed question
    response = genai.embed_content(
        model="models/embedding-001",
        content=question
    )
    query_embedding = response["embedding"]

    # Retrieve top matches from uploaded documents
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results
    )

    # Extract contexts from uploaded documents
    contexts = []
    if results["metadatas"] and len(results["metadatas"]) > 0:
        for metadata_list in results["metadatas"]:
            if metadata_list and len(metadata_list) > 0:
                for metadata in metadata_list:
                    if "text" in metadata:
                        contexts.append(metadata["text"])

    # Build the prompt based on available context
    if contexts:
        # We have uploaded documents - use RAG approach
        context_text = "\n".join(contexts)
        prompt = f"""You are a helpful AI assistant with access to both uploaded documents and your own knowledge.

        First, analyze the uploaded document context below:
        {context_text}

        Now, answer the user's question by:
        1. Using relevant information from the uploaded documents above
        2. Supplementing with your own knowledge to provide a comprehensive answer
        3. If the uploaded documents don't contain enough information, use your knowledge to fill in the gaps

        User Question: {question}

        Please provide a comprehensive, well-structured response that combines both sources of information."""
    else:
        # No uploaded documents - use only Gemini's knowledge
        prompt = f"""Please answer the following question using your own knowledge. Provide a comprehensive and accurate response.

        Question: {question}"""

    try:
        # Generate response using Gemini 2.0 Flash
        response = gemini_model.generate_content(prompt)
        answer = response.text
        
        # Remove formatting symbols like ** and *
        import re
        answer = re.sub(r'\*\*(.*?)\*\*', r'\1', answer)  # Remove **text**
        answer = re.sub(r'\*(.*?)\*', r'\1', answer)      # Remove *text*
        
        return answer
        
    except Exception as e:
        # Fallback to basic context if Gemini fails
        print(f"Error with Gemini: {e}")
        if contexts:
            return f"Based on the available information: {' '.join(contexts[:2])}"
        else:
            return "I apologize, but I'm currently unable to access my knowledge base. Please try again later."
