"""
Quick test script to diagnose analyzer issues
Run this from the Django project root: python test_analyzer.py
"""
import os
import sys
from pathlib import Path

# Add project to path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

print("=== Analyzer Diagnostic Test ===\n")

# Test 1: Check .env file
print("1. Checking .env file...")
env_path = BASE_DIR / '.env'
if env_path.exists():
    print(f"   [OK] .env file exists at: {env_path}")
    with open(env_path, 'r') as f:
        content = f.read()
        if 'GEMINI_API_KEY' in content:
            # Check if it has a value (not just the placeholder)
            lines = content.split('\n')
            for line in lines:
                if 'GEMINI_API_KEY' in line and 'your_gemini_api_key' not in line.lower():
                    print(f"   [OK] GEMINI_API_KEY is set")
                    break
            else:
                print(f"   [WARN] GEMINI_API_KEY found but may be placeholder")
        else:
            print(f"   [ERROR] GEMINI_API_KEY not found in .env")
else:
    print(f"   [ERROR] .env file NOT found at: {env_path}")

# Test 2: Check if analyse_pdf.py exists
print("\n2. Checking analyse_pdf.py...")
analyzer_path = BASE_DIR / 'frontend' / 'public' / 'Analyzer' / 'analyse_pdf.py'
if analyzer_path.exists():
    print(f"   [OK] analyse_pdf.py exists at: {analyzer_path}")
else:
    print(f"   [ERROR] analyse_pdf.py NOT found at: {analyzer_path}")

# Test 3: Try importing analyse_pdf
print("\n3. Testing import of analyse_pdf...")
try:
    sys.path.insert(0, str(analyzer_path.parent))
    from analyse_pdf import analyse_resume_gemini, extract_basic_info
    print("   [OK] Successfully imported analyse_pdf functions")
except ImportError as e:
    print(f"   [ERROR] Import failed: {e}")
    import traceback
    traceback.print_exc()
except Exception as e:
    print(f"   [ERROR] Error during import: {e}")
    import traceback
    traceback.print_exc()

# Test 4: Check if PyMuPDF is installed
print("\n4. Checking PyMuPDF (fitz)...")
try:
    import fitz
    print(f"   [OK] PyMuPDF is installed (version: {fitz.version})")
except ImportError:
    print("   [ERROR] PyMuPDF (fitz) is NOT installed")
    print("   Solution: pip install PyMuPDF")

# Test 5: Check if google-generativeai is installed
print("\n5. Checking google-generativeai...")
try:
    import google.generativeai as genai
    print("   [OK] google-generativeai is installed")
except ImportError:
    print("   [ERROR] google-generativeai is NOT installed")
    print("   Solution: pip install google-generativeai")

# Test 6: Check if GEMINI_API_KEY can be loaded
print("\n6. Testing GEMINI_API_KEY loading...")
from dotenv import load_dotenv
load_dotenv(env_path)
api_key = os.getenv("GEMINI_API_KEY")
if api_key and api_key != "your_gemini_api_key_here":
    print(f"   [OK] GEMINI_API_KEY loaded (length: {len(api_key)} chars)")
    # Test if it's valid (basic check - not empty and not placeholder)
    if len(api_key) > 10:
        print("   [OK] API key looks valid")
    else:
        print("   [WARN] API key seems too short")
else:
    print("   [ERROR] GEMINI_API_KEY not loaded or is placeholder")
    print("   Solution: Add GEMINI_API_KEY=your_actual_key to .env file")

# Test 7: Check analyzer_script import
print("\n7. Testing analyzer_script import...")
try:
    from api.analyzer_script import analyze_resume_logic, extract_text_from_resume
    print("   [OK] analyzer_script imported successfully")
except Exception as e:
    print(f"   [ERROR] analyzer_script import failed: {e}")
    import traceback
    traceback.print_exc()

print("\n=== Diagnostic Complete ===")
print("\nIf you see errors above, fix them before running the analyzer.")
print("Most common issues:")
print("1. Missing GEMINI_API_KEY in .env file")
print("2. Missing Python packages (run: pip install -r requirements.txt)")
print("3. analyse_pdf.py not found or has errors")
