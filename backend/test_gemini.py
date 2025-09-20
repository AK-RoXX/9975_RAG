#!/usr/bin/env python3
"""
Test script to verify Gemini 2.0 Flash integration
"""

import google.generativeai as genai
from env import api_key

def test_gemini_connection():
    """Test if Gemini 2.0 Flash is accessible"""
    try:
        # Configure API key
        genai.configure(api_key=api_key)
        
        # Initialize Gemini 2.0 Flash model
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # Test with a simple prompt
        prompt = "Hello! Can you tell me what you are?"
        response = model.generate_content(prompt)
        
        print("✅ Gemini 2.0 Flash connection successful!")
        print(f"Response: {response.text}")
        return True
        
    except Exception as e:
        print(f"❌ Error connecting to Gemini 2.0 Flash: {e}")
        return False

def test_embedding():
    """Test if embeddings are working"""
    try:
        # Test embedding
        response = genai.embed_content(
            model="models/embedding-001",
            content="This is a test sentence for embedding."
        )
        
        print("✅ Embedding generation successful!")
        print(f"Embedding dimensions: {len(response['embedding'])}")
        return True
        
    except Exception as e:
        print(f"❌ Error generating embeddings: {e}")
        return False

if __name__ == "__main__":
    print("Testing Gemini 2.0 Flash Integration...")
    print("=" * 50)
    
    # Test Gemini connection
    gemini_ok = test_gemini_connection()
    print()
    
    # Test embeddings
    embedding_ok = test_embedding()
    print()
    
    if gemini_ok and embedding_ok:
        print("🎉 All tests passed! Your RAG system is ready to use with Gemini 2.0 Flash.")
    else:
        print("⚠️  Some tests failed. Please check your API key and internet connection.")
