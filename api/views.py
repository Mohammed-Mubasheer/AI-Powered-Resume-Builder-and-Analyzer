# backend/api/views.py

import os
import io
import uuid
import json
from datetime import datetime
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, viewsets, generics, permissions
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.models import User
import google.generativeai as genai

# Models & Serializers
from .models import Resume, Analysis
from .serializers import UserSerializer, ResumeSerializer

# --- IMPORT YOUR NEW LOGIC BRIDGE ---
# This imports the function that orchestrates PyMuPDF + Gemini + Roadmap
try:
    from .analyzer_script import analyze_resume_logic, extract_text_from_resume
except ImportError:
    # Fallback if files aren't created yet, though they are required
    print("Warning: analyzer_script.py not found. Please ensure it exists.")
    analyze_resume_logic = None
    extract_text_from_resume = None

# --- AUTH & USER VIEWS ---

class HelloApiView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        return Response({'message': 'Hello from Django!'})

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            User.objects.create_user(
                username=serializer.validated_data['username'], 
                email=serializer.validated_data.get('email', ''), 
                password=serializer.validated_data['password']
            )
            return Response({'username': serializer.validated_data['username']}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- RESUME BUILDER CRUD VIEWS ---

class ResumeViewSet(viewsets.ModelViewSet):
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self): 
        return Resume.objects.filter(user=self.request.user).order_by('-updated_at')
    
    def perform_create(self, serializer): 
        serializer.save(user=self.request.user)

class ResumeListCreateView(generics.ListCreateAPIView):
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user).order_by('-updated_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ResumeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ResumeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Resume.objects.filter(user=self.request.user)

# --- AI TOOLS FOR BUILDER (Enhance & Parse) ---

class EnhanceWithAIView(APIView):
    """
    Used in the Builder to rewrite text (e.g., Summary, Experience)
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        text_to_enhance = request.data.get('text', '')
        if not text_to_enhance:
            return Response({'error': 'No text provided'}, status=400)

        try:
            # Configure Gemini
            api_key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-flash-latest')
            
            prompt = (
                f"Act as a Senior Resume Consultant. Rewrite the text below to be ATS-friendly, professional, and impactful.\n"
                f"Fix grammar. Preserve hard skills. Output ONLY the rewritten text.\n\n"
                f"Text: {text_to_enhance}"
            )
            
            response = model.generate_content(prompt)
            clean_text = response.text.strip().replace('"', '').replace("'", "")
            return Response({'enhanced_text': clean_text}, status=200)

        except Exception as e:
            print(f"AI Enhance Error: {e}")
            return Response({'enhanced_text': text_to_enhance, 'error': str(e)}, status=200)

class ParseResumeView(APIView):
    """
    Used in the Builder to fill the form from an uploaded resume
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        resume_file = request.FILES.get('file')
        if not resume_file:
            return Response({"error": "No file provided"}, status=400)

        try:
            # 1. Save temporarily to read with fitz (PyMuPDF) if needed, 
            # or read stream if your extract function supports it.
            # Here we reuse the stream logic if possible, or save temp.
            
            # Simple text extraction for Parsing
            import fitz # PyMuPDF
            text = ""
            
            # Read file stream
            file_bytes = resume_file.read()
            
            if resume_file.name.lower().endswith('.pdf'):
                with fitz.open(stream=file_bytes, filetype="pdf") as doc:
                    for page in doc:
                        text += page.get_text()
            else:
                # Basic DOCX fallback
                from docx import Document
                doc = Document(io.BytesIO(file_bytes))
                text = "\n".join([p.text for p in doc.paragraphs])

            if not text:
                return Response({"error": "Could not extract text"}, status=400)

            # 2. Gemini Parse
            api_key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            prompt = f"""
            You are a resume parser. Extract data from the text below and return ONLY valid JSON.
            Structure:
            {{
                "personalInfo": {{ "name": "", "email": "", "phone": "", "linkedin": "" }},
                "summary": "",
                "experience": [ {{ "title": "", "company": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM", "description": "", "currentlyWorking": false }} ],
                "education": [ {{ "institutionName": "", "degree": "", "date": "YYYY-MM" }} ],
                "skills": [ {{ "name": "Skill1" }}, {{ "name": "Skill2" }} ]
            }}
            Resume Text: {text}
            """
            
            response = model.generate_content(prompt)
            cleaned_response = response.text.replace('```json', '').replace('```', '').strip()
            parsed_data = json.loads(cleaned_response)
            
            return Response(parsed_data, status=200)

        except Exception as e:
            print(f"Parsing Error: {e}")
            return Response({"error": "Failed to parse resume"}, status=500)

# --- CORE ANALYZER VIEW (THE BIG UPDATE) ---

class ResumeAnalysisView(APIView):
    """
    Main Analyzer Endpoint.
    Receives PDF -> Orchestrates Analysis via analyzer_script.py -> Returns Detailed JSON
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        # 1. Validation
        if not analyze_resume_logic:
            return Response({"success": False, "error": "Analyzer script not loaded correctly on server."}, status=500)

        resume_file = request.FILES.get('resume_file')
        job_role = request.data.get('job_role')
        job_description = request.data.get('job_description', '')

        if not resume_file or not job_role:
            return Response({"success": False, "error": "Missing resume file or job role."}, status=400)

        # 2. File Handling (Save to Temp)
        # PyMuPDF/Gemini logic often works best with a physical file path
        try:
            temp_dir = os.path.join(settings.MEDIA_ROOT, 'temp')
            os.makedirs(temp_dir, exist_ok=True)
            
            file_ext = os.path.splitext(resume_file.name)[1]
            temp_filename = f"{uuid.uuid4()}{file_ext}"
            temp_path = os.path.join(temp_dir, temp_filename)

            with open(temp_path, 'wb+') as destination:
                for chunk in resume_file.chunks():
                    destination.write(chunk)

            # 3. CALL THE LOGIC BRIDGE
            # This calls the function in analyzer_script.py which handles
            # Extract -> Analyze (Gemini) -> Roadmap -> Merge
            try:
                analysis_report = analyze_resume_logic(temp_path, job_role, job_description)
            except Exception as analysis_error:
                import traceback
                error_trace = traceback.format_exc()
                print(f"Error in analyze_resume_logic: {analysis_error}")
                print(f"Traceback:\n{error_trace}")
                return Response({
                    "success": False,
                    "error": f"Analysis failed: {str(analysis_error)}",
                    "error_details": error_trace if settings.DEBUG else "Check server logs"
                }, status=500)

            # 4. Save to Database (Optional, for history)
            # Note: Database save is optional - if it fails, we still return the analysis results
            try:
                # Reset file pointer before saving (file was read earlier)
                resume_file.seek(0)
                Analysis.objects.create(
                    user=request.user,
                    job_role=job_role,
                    resume_file=resume_file,
                    ats_score_general=analysis_report.get('ats_score_role', 0),
                    ats_score_jd_match=analysis_report.get('ats_score_jd', 0),
                    analysis_result=analysis_report
                )
            except Exception as db_e:
                # Database save is optional - log but don't fail the request
                import traceback
                print(f"Database Save Error (Non-fatal): {db_e}")
                print(f"Database Save Traceback:")
                traceback.print_exc()
                # Continue - analysis was successful even if DB save failed

            # 5. Cleanup Temp File
            if os.path.exists(temp_path):
                os.remove(temp_path)

            # 6. Return Data to React
            # Ensure the 'success' flag is present
            if not analysis_report.get('success'):
                analysis_report['success'] = True

            return Response(analysis_report, status=200)

        except Exception as e:
            # Cleanup on error
            if 'temp_path' in locals() and os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except:
                    pass
            
            import traceback
            error_trace = traceback.format_exc()
            print(f"Analysis Critical Error: {e}")
            print(f"Full traceback:\n{error_trace}")
            
            return Response({
                "success": False, 
                "error": str(e),
                "error_details": error_trace if settings.DEBUG else "Check server logs for details"
            }, status=500)

# --- PDF DOWNLOAD ENDPOINTS ---

from django.http import HttpResponse
from .pdf_generator import generate_roadmap_pdf, generate_complete_report_pdf

class DownloadRoadmapView(APIView):
    """Download learning roadmap as PDF"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        roadmap_data = request.data.get('roadmap')
        basic_info = request.data.get('basic_info')
        
        if not roadmap_data:
            return Response({"error": "No roadmap data available"}, status=400)
        
        try:
            pdf_buffer = generate_roadmap_pdf(roadmap_data, basic_info)
            
            response = HttpResponse(
                pdf_buffer.getvalue(),
                content_type='application/pdf'
            )
            response['Content-Disposition'] = f'attachment; filename=learning_roadmap_{datetime.now().strftime("%Y%m%d")}.pdf'
            return response
        except Exception as e:
            print(f"PDF Generation Error: {e}")
            return Response({"error": str(e)}, status=500)


class DownloadReportView(APIView):
    """Download complete analysis report as PDF"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        result = request.data.get('result')
        basic_info = request.data.get('basic_info')
        roadmap = request.data.get('roadmap')
        
        if not result:
            return Response({"error": "No analysis data available"}, status=400)
        
        try:
            pdf_buffer = generate_complete_report_pdf(result, basic_info, roadmap)
            
            response = HttpResponse(
                pdf_buffer.getvalue(),
                content_type='application/pdf'
            )
            response['Content-Disposition'] = f'attachment; filename=resume_analysis_report_{datetime.now().strftime("%Y%m%d")}.pdf'
            return response
        except Exception as e:
            print(f"PDF Generation Error: {e}")
            return Response({"error": str(e)}, status=500)