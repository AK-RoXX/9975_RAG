#!/usr/bin/env python3
"""
Test script to verify embedding clearing functionality
"""

import os
import sys

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from process_file import clear_all_embeddings, collection

def test_clear_functionality():
    """Test if the clear functionality works"""
    print("Testing embedding clearing functionality...")
    print("=" * 50)
    
    try:
        # Test clearing embeddings
        print("🧪 Testing clear_all_embeddings function...")
        clear_all_embeddings()
        
        # Check if collection is empty
        results = collection.get()
        if len(results["ids"]) == 0:
            print("✅ Embeddings cleared successfully - collection is empty")
        else:
            print(f"⚠️  Collection still has {len(results['ids'])} embeddings")
            
        print("\n🎉 Clear functionality test completed!")
        
    except Exception as e:
        print(f"❌ Error testing clear functionality: {e}")

if __name__ == "__main__":
    test_clear_functionality()
