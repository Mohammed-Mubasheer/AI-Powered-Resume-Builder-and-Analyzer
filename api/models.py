# api/models.py
from django.db import models
from django.contrib.auth.models import User

# --- Ensure this class definition exists and is spelled correctly ---
class Resume(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200, default="Untitled Resume")
    resume_data = models.JSONField() # Stores the main resume content as JSON
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        # Provides a readable name in the Django admin
        return f"{self.user.username}'s Resume - {self.title}"
# -------------------------------------------------------------------

# --- NEW: Analysis Model ---
class Analysis(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    job_role = models.CharField(max_length=100)
    resume_file = models.FileField(upload_to='resumes/')

    # Make sure these exist!
    ats_score_general = models.IntegerField(default=0)
    ats_score_jd_match = models.IntegerField(default=0, null=True)
    analysis_result = models.JSONField(default=dict) # Requires Django 3.0+

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.job_role} ({self.created_at.strftime('%Y-%m-%d')})"