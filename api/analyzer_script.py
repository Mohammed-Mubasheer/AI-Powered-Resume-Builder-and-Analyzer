"""
Django integration script for resume analysis.
This bridges the Flask analyzer logic with Django.
"""
import os
import sys
import fitz  # PyMuPDF
from pathlib import Path

# Add the Flask Analyzer path to sys.path to import analyse_pdf
BASE_DIR = Path(__file__).resolve().parent.parent
ANALYZER_PATH = BASE_DIR / 'frontend' / 'public' / 'Analyzer'

# Add to path if not already there
if str(ANALYZER_PATH) not in sys.path:
    sys.path.insert(0, str(ANALYZER_PATH))

try:
    from analyse_pdf import analyse_resume_gemini, extract_basic_info, generate_learning_roadmap
except ImportError as e:
    print(f"Warning: Could not import from analyse_pdf: {e}")
    # Fallback - define minimal functions
    def analyse_resume_gemini(resume_content, job_description):
        return {"error": "Analysis module not available", "match_score": 0}
    def extract_basic_info(resume_content):
        return {}
    def generate_learning_roadmap(resume_content, job_description, missing_skills, analysis_result):
        return {}


def extract_text_from_resume(pdf_path):
    """Extract text from PDF using PyMuPDF"""
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text
    except Exception as e:
        print(f"Error extracting text: {e}")
        return ""


def analyze_resume_logic(pdf_path, job_role, job_description):
    """
    Main orchestration function for resume analysis.
    This is called from Django views.
    
    Returns a dictionary with:
    - success: bool
    - match_score: int
    - matching_skills: list
    - missing_skills: list
    - summary: str
    - strengths: list
    - weaknesses: list
    - youtube_videos: list
    - project_suggestions: list
    - recommendations: list
    - basic_info: dict
    - roadmap: dict (optional)
    """
    try:
        # 1. Extract text from PDF
        resume_content = extract_text_from_resume(pdf_path)
        if not resume_content:
            return {
                "success": False,
                "error": "Could not extract text from PDF"
            }
        
        # 2. Analyze resume with Gemini
        result = analyse_resume_gemini(resume_content, job_description)
        
        # Check for errors
        if result.get('error'):
            return {
                "success": False,
                "error": result.get('summary', 'Analysis failed'),
                "error_message": result.get('error_message', ''),
                **result
            }
        
        # 3. Extract basic info
        basic_info = extract_basic_info(resume_content)
        
        # 4. Generate learning roadmap if missing skills exist
        roadmap = None
        if result and not result.get('error') and result.get('missing_skills'):
            try:
                roadmap = generate_learning_roadmap(
                    resume_content,
                    job_description,
                    result.get('missing_skills', []),
                    result
                )
            except Exception as e:
                print(f"Roadmap generation error: {e}")
                roadmap = None
        
        # 5. Combine all results
        analysis_report = {
            "success": True,
            "match_score": result.get('match_score', 0),
            "ats_score_role": result.get('match_score', 0),  # For compatibility
            "ats_score_jd": result.get('match_score', 0),  # For compatibility
            "matching_skills": result.get('matching_skills', []),
            "role_matching_skills": result.get('matching_skills', []),  # For compatibility
            "missing_skills": result.get('missing_skills', []),
            "role_missing_skills": result.get('missing_skills', []),  # For compatibility
            "summary": result.get('summary', ''),
            "strengths": result.get('strengths', []),
            "weaknesses": result.get('weaknesses', []),
            "youtube_videos": result.get('youtube_videos', []),
            "project_suggestions": result.get('project_suggestions', []),
            "recommendations": result.get('recommendations', []),
            "basic_info": basic_info,
            "name": basic_info.get('full_name', 'N/A'),
            "email": basic_info.get('email', 'N/A'),
            "phone": basic_info.get('contact_number', 'N/A'),
            "linkedin": basic_info.get('linkedin', ''),
            "github": basic_info.get('github', ''),
        }
        
        # Add roadmap if available
        if roadmap:
            analysis_report["roadmap"] = roadmap
        
        return analysis_report
        
    except Exception as e:
        print(f"Critical error in analyze_resume_logic: {e}")
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e),
            "match_score": 0,
            "matching_skills": [],
            "missing_skills": [],
            "summary": f"Error: {str(e)}",
            "strengths": [],
            "weaknesses": [],
            "youtube_videos": [],
            "project_suggestions": [],
            "recommendations": ["There was an error processing your request. Please try again."],
            "basic_info": {}
        }
