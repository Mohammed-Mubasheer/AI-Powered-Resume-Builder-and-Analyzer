import React, { useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './AnalyzerPage.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

const AnalyzerPage = () => {
  const navigate = useNavigate();
  const { authTokens } = useContext(AuthContext);
  
  // State
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [basicInfo, setBasicInfo] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [showRoadmap, setShowRoadmap] = useState(false);
  
  // Refs for scrolling
  const videoScrollWrapper = useRef(null);
  const projectScrollWrapper = useRef(null);

  useEffect(() => {
    AOS.init({ duration: 800, easing: 'ease-in-out', once: true });
    document.body.classList.add('analyzer-body');
    return () => {
      document.body.classList.remove('analyzer-body');
    };
  }, []);

  // Animate score on load
  useEffect(() => {
    if (result && result.match_score) {
      const scoreElement = document.getElementById('score-value');
      if (scoreElement) {
        const finalScore = parseInt(result.match_score);
        let currentScore = 0;
        const increment = finalScore / 50;
        const timer = setInterval(() => {
          currentScore += increment;
          if (currentScore >= finalScore) {
            currentScore = finalScore;
            clearInterval(timer);
          }
          scoreElement.textContent = Math.round(currentScore);
        }, 30);
        return () => clearInterval(timer);
      }
    }
  }, [result]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please upload a resume');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setBasicInfo(null);
    setRoadmap(null);
    setShowRoadmap(false);

    const formData = new FormData();
    formData.append('resume_file', file);
    formData.append('job_role', 'Software Engineer');
    formData.append('job_description', jobDesc);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/analyze/', formData, {
        headers: { 
          'Authorization': 'Bearer ' + String(authTokens.access),
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setResult(response.data);
        setBasicInfo(response.data.basic_info || null);
        setRoadmap(response.data.roadmap || null);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert('Analysis failed: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      // Log everything about the error
      console.group('=== ANALYSIS ERROR DETAILS ===');
      console.error('Error Type:', error.constructor.name);
      console.error('Error Message:', error.message);
      console.error('Error Code:', error.code);
      
      if (error.response) {
        // Server responded with error
        console.error('Response Status:', error.response.status);
        console.error('Response Status Text:', error.response.statusText);
        console.error('Response Headers:', error.response.headers);
        console.error('Response Data:', error.response.data);
        console.error('Response Data (stringified):', JSON.stringify(error.response.data, null, 2));
        
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            console.error('Response is a string:', error.response.data);
          } else if (error.response.data.error) {
            console.error('Error field:', error.response.data.error);
          }
          if (error.response.data.error_details) {
            console.error('Error details:', error.response.data.error_details);
          }
        }
      } else if (error.request) {
        console.error('No response received. Request:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      console.error('Full error object:', error);
      console.groupEnd();
      console.error('=== ANALYSIS ERROR ===');
      console.error('Error:', error);
      console.error('Error Response:', error.response);
      console.error('Error Status:', error.response?.status);
      console.error('Error Status Text:', error.response?.statusText);
      console.error('Error Data:', error.response?.data);
      if (error.response?.data) {
        console.error('Error Message:', error.response.data.error);
        console.error('Error Details:', error.response.data.error_details);
        console.error('Full Error Data (JSON):', JSON.stringify(error.response.data, null, 2));
      }
      console.error('==========================');
      
      let errorMessage = 'Error connecting to server. ';
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 401) {
          errorMessage += 'Authentication failed. Please login again.';
        } else if (error.response.status === 403) {
          errorMessage += 'Access forbidden. Please check your permissions.';
        } else if (error.response.status === 404) {
          errorMessage += 'API endpoint not found. Please check if Django server is running.';
        } else if (error.response.status === 500) {
          errorMessage += 'Server error: ' + (error.response.data?.error || 'Internal server error');
        } else {
          errorMessage += `Server error (${error.response.status}): ${error.response.data?.error || error.response.statusText}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage += 'No response from server. Please check:\n';
        errorMessage += '1. Django server is running at http://127.0.0.1:8000\n';
        errorMessage += '2. Check browser console for CORS errors\n';
        errorMessage += '3. Check Django terminal for errors';
      } else {
        // Error setting up the request
        errorMessage += error.message;
      }
      
      // Show detailed error in console
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      if (error.response?.data) {
        console.error('Server error response data:', JSON.stringify(error.response.data, null, 2));
        if (error.response.data.error) {
          console.error('Error message:', error.response.data.error);
        }
        if (error.response.data.error_details) {
          console.error('Error details:', error.response.data.error_details);
        }
        // Show the actual error from server in alert
        if (error.response.data.error) {
          errorMessage += '\n\nServer Error: ' + error.response.data.error;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollVideos = (direction) => {
    if (videoScrollWrapper.current) {
      const scrollAmount = 350;
      const currentScroll = videoScrollWrapper.current.scrollLeft;
      videoScrollWrapper.current.scrollTo({
        left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollProjects = (direction) => {
    if (projectScrollWrapper.current) {
      const scrollAmount = 350;
      const currentScroll = projectScrollWrapper.current.scrollLeft;
      projectScrollWrapper.current.scrollTo({
        left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const toggleRoadmap = () => {
    setShowRoadmap(!showRoadmap);
    if (!showRoadmap) {
      setTimeout(() => {
        const roadmapContent = document.getElementById('roadmapContent');
        if (roadmapContent) {
          roadmapContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const downloadRoadmap = async () => {
    if (!roadmap) {
      alert('No roadmap data available');
      return;
    }

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/download/roadmap/',
        {
          roadmap: roadmap,
          basic_info: basicInfo
        },
        {
          headers: {
            'Authorization': 'Bearer ' + String(authTokens.access),
            'Content-Type': 'application/json'
          },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `learning_roadmap_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();  
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error:', error);
      alert('Error downloading roadmap. Please try again.');
    }
  };

  const downloadCompleteReport = async () => {
    if (!result) {
      alert('No analysis data available');
      return;
    }

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/download/report/',
        {
          result: result,
          basic_info: basicInfo,
          roadmap: roadmap
        },
        {
          headers: {
            'Authorization': 'Bearer ' + String(authTokens.access),
            'Content-Type': 'application/json'
          },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume_analysis_report_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error:', error);
      alert('Error downloading report. Please try again.');
    }
  };

  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <div className="container">
            <a className="navbar-brand" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
              <i className="fas fa-brain"></i> AI Resume Analyzer
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-container">
        
        {/* Upload Form Card */}
        <div className="card upload-card fade-in-up">
          <div className="card-header">
            <h3><i className="fas fa-file-upload"></i> Upload Your Resume</h3>
          </div>
          <div className="card-body">
            <form id="analyzeForm" onSubmit={handleAnalyze}>
              <div className="mb-4">
                <label className="form-label">
                  <i className="fas fa-file-pdf"></i> Resume (PDF Format)
                </label>
                <input 
                  className="form-control" 
                  type="file" 
                  name="resume" 
                  accept=".pdf" 
                  onChange={(e) => setFile(e.target.files[0])}
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="form-label">
                  <i className="fas fa-briefcase"></i> Job Description
                </label>
                <textarea 
                  className="form-control" 
                  name="job_description" 
                  rows="8" 
                  required 
                  placeholder="Paste the job description here..."
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                ></textarea>
              </div>
              <div className="d-grid">
                <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Analyzing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-search"></i> Analyze Resume
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Spinner */}
            {isLoading && (
              <div className="spinner-container" id="spinner" style={{ display: 'block' }}>
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3"><strong>Analyzing your resume...</strong><br />This may take a few moments</p>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div id="results-section">
            
            {/* Error Display */}
            {result.error ? (
              <div className="card fade-in-up" style={{ border: '2px solid #EF4444', background: 'linear-gradient(135deg, #FEE2E2, #FECACA)' }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-start">
                    <i className="fas fa-exclamation-triangle text-danger me-3" style={{ fontSize: '2rem' }}></i>
                    <div style={{ flex: 1 }}>
                      <h4 className="text-danger mb-3"><strong>API Error</strong></h4>
                      <p className="mb-2" style={{ fontSize: '1.1rem', color: '#7F1D1D' }}><strong>{result.summary}</strong></p>
                      {result.recommendations && result.recommendations.length > 0 && (
                        <div className="mt-3">
                          <h5 style={{ color: '#991B1B' }}>పరిష్కారాలు (Solutions):</h5>
                          <ul className="mt-2" style={{ color: '#7F1D1D' }}>
                            {result.recommendations.map((rec, i) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {result.error_message && (
                        <details className="mt-3">
                          <summary style={{ cursor: 'pointer', color: '#991B1B', fontWeight: 'bold' }}>Technical Details (Click to expand)</summary>
                          <pre className="mt-2 p-2" style={{ background: 'rgba(0,0,0,0.1)', borderRadius: '4px', overflowX: 'auto', fontSize: '0.85rem' }}>{result.error_message}</pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Score Card */}
                <div className="card fade-in-up">
                  <div className="score-container">
                    <div className="score-circle">
                      <div>
                        <div className="score-value" id="score-value">{result.match_score || 0}</div>
                        <div className="score-label">Match Score</div>
                      </div>
                    </div>
                    <p className="mt-3" style={{ fontSize: '1.1rem', opacity: 0.9 }}>{result.summary}</p>
                  </div>
                </div>

                {/* Applicant Basic Info */}
                {basicInfo && (
                  <div className="card fade-in-up applicant-info-card">
                    <div className="card-header">
                      <h3><i className="fas fa-user"></i> Applicant Information</h3>
                    </div>
                    <div className="card-body p-4">
                      <div className="row g-3">
                        {basicInfo.full_name && (
                          <div className="col-md-6">
                            <div className="applicant-info-item">
                              <label>Full Name:</label>
                              <div className="info-value">
                                <i className="fas fa-user"></i>
                                <span>{basicInfo.full_name}</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {basicInfo.contact_number && (
                          <div className="col-md-6">
                            <div className="applicant-info-item">
                              <label>Contact Number:</label>
                              <div className="info-value">
                                <i className="fas fa-phone"></i>
                                <a href={`tel:${basicInfo.contact_number}`}>
                                  {basicInfo.contact_number}
                                </a>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {basicInfo.email && (
                          <div className="col-md-6">
                            <div className="applicant-info-item">
                              <label>Email:</label>
                              <div className="info-value">
                                <i className="fas fa-envelope"></i>
                                <a href={`mailto:${basicInfo.email}`}>
                                  {basicInfo.email}
                                </a>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {basicInfo.github && (
                          <div className="col-md-6">
                            <div className="applicant-info-item">
                              <label>GitHub:</label>
                              <div className="info-value">
                                <i className="fab fa-github github-icon"></i>
                                <a 
                                  href={basicInfo.github} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  {basicInfo.github}
                                  <i className="fas fa-external-link-alt ms-1" style={{ fontSize: '0.7rem' }}></i>
                                </a>
                              </div>
                            </div>
                          </div>
                        )}

{basicInfo.linkedin && (
  <div className="col-md-6">
    <div className="applicant-info-item">
      <label>LinkedIn:</label>
      <div className="info-value">
        <i className="fab fa-linkedin linkedin-icon"></i>
        <a
          href={
            basicInfo.linkedin.startsWith("http")
              ? basicInfo.linkedin
              : `https://${basicInfo.linkedin}`
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          {basicInfo.linkedin}
          <i
            className="fas fa-external-link-alt ms-1"
            style={{ fontSize: "0.7rem" }}
          ></i>
        </a>
      </div>
    </div>
  </div>
)}

                      </div>
                    </div>
                  </div>
                )}

                {/* Matching Skills */}
                {result.matching_skills && result.matching_skills.length > 0 && (
                  <div className="card fade-in-up">
                    <div className="card-body p-4">
                      <div className="section-header">
                        <i className="fas fa-check-circle"></i>
                        <h4>Matching Skills</h4>
                      </div>
                      <div>
                        {result.matching_skills.map((skill, i) => (
                          <span key={i} className="skill-badge skill-match">
                            <i className="fas fa-check"></i> {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Missing Skills */}
                {result.missing_skills && result.missing_skills.length > 0 && (
                  <div className="card fade-in-up">
                    <div className="card-body p-4">
                      <div className="section-header">
                        <i className="fas fa-exclamation-circle"></i>
                        <h4>Missing Skills</h4>
                      </div>
                      <div>
                        {result.missing_skills.map((skill, i) => (
                          <span key={i} className="skill-badge skill-missing">
                            <i className="fas fa-times"></i> {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Strengths & Weaknesses */}
                <div className="row">
                  {result.strengths && result.strengths.length > 0 && (
                    <div className="col-md-6">
                      <div className="card fade-in-up">
                        <div className="card-body p-4">
                          <div className="section-header">
                            <i className="fas fa-thumbs-up"></i>
                            <h4>Strengths</h4>
                          </div>
                          {result.strengths.map((strength, i) => (
                            <div key={i} className="strength-item">
                              <i className="fas fa-check-circle"></i>
                              <span>{strength}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {result.weaknesses && result.weaknesses.length > 0 && (
                    <div className="col-md-6">
                      <div className="card fade-in-up">
                        <div className="card-body p-4">
                          <div className="section-header">
                            <i className="fas fa-exclamation-triangle"></i>
                            <h4>Areas for Improvement</h4>
                          </div>
                          {result.weaknesses.map((weakness, i) => (
                            <div key={i} className="weakness-item">
                              <i className="fas fa-exclamation-circle"></i>
                              <span>{weakness}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* YouTube Videos & Projects Side by Side */}
                <div className="videos-projects-container">
                  {/* YouTube Videos */}
                  {result.youtube_videos && result.youtube_videos.length > 0 && (
                    <div className="card fade-in-up">
                      <div className="card-body p-4">
                        <div className="section-header">
                          <i className="fab fa-youtube" style={{ color: '#d53f0e' }}></i>
                          <h4>Recommended Learning Videos</h4>
                        </div>
                        <div className="scroll-container">
                          <button className="scroll-arrow scroll-arrow-left" onClick={() => scrollVideos('left')}>
                            <i className="fas fa-chevron-left"></i>
                          </button>
                          <div className="scroll-wrapper" id="videoScrollWrapper" ref={videoScrollWrapper}>
                            {result.youtube_videos.map((video, i) => (
                              <div key={i} className="scroll-item">
                                <div className="video-card">
                                  <div className="video-icon">
                                    <i className="fab fa-youtube"></i>
                                  </div>
                                  <div className="video-card-body">
                                    <div className="video-skill-tag mb-2">{video.skill}</div>
                                    <h6 className="video-card-title">{video.title}</h6>
                                    <a href={video.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary mt-2 w-100" style={{ background: '#FF0000', borderColor: '#FF0000' }}>
                                      <i className="fas fa-play"></i> WATCH VIDEO
                                    </a>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <button className="scroll-arrow scroll-arrow-right" onClick={() => scrollVideos('right')}>
                            <i className="fas fa-chevron-right"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Project Suggestions */}
                  {result.project_suggestions && result.project_suggestions.length > 0 && (
                    <div className="card fade-in-up">
                      <div className="card-body p-4">
                        <div className="section-header">
                          <i className="fas fa-project-diagram"></i>
                          <h4>Recommended Projects</h4>
                        </div>
                        <div className="scroll-container">
                          <button className="scroll-arrow scroll-arrow-left" onClick={() => scrollProjects('left')}>
                            <i className="fas fa-chevron-left"></i>
                          </button>
                          <div className="scroll-wrapper" id="projectScrollWrapper" ref={projectScrollWrapper}>
                            {result.project_suggestions.map((project, i) => (
                              <div key={i} className="scroll-item">
                                <div className="project-card">
                                  <h5 className="project-title">
                                    <i className="fas fa-code"></i> {project.title}
                                  </h5>
                                  <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: 1.4, flexGrow: 1 }}>{project.description}</p>
                                  <div className="mb-2">
                                    {project.technologies && project.technologies.map((tech, j) => (
                                      <span key={j} className="project-tech">{tech}</span>
                                    ))}
                                  </div>
                                  <div className="d-flex justify-content-between align-items-center mt-auto" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <span className={`difficulty-badge difficulty-${project.difficulty}`}>
                                      {project.difficulty ? project.difficulty.charAt(0).toUpperCase() + project.difficulty.slice(1) : 'Intermediate'}
                                    </span>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                      {project.youtube_url && (
                                        <a href={project.youtube_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ background: '#FF0000', color: 'white', border: 'none', borderRadius: '8px', padding: '0.35rem 0.8rem', textDecoration: 'none', transition: 'all 0.3s ease', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                          <i className="fab fa-youtube me-1"></i> YouTube
                                          <i className="fas fa-external-link-alt ms-1" style={{ fontSize: '0.7rem' }}></i>
                                        </a>
                                      )}
                                      {project.github_url && (
                                        <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ background: '#333', color: 'white', border: 'none', borderRadius: '8px', padding: '0.35rem 0.8rem', textDecoration: 'none', transition: 'all 0.3s ease', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                          <i className="fab fa-github me-1"></i> GitHub
                                          <i className="fas fa-external-link-alt ms-1" style={{ fontSize: '0.7rem' }}></i>
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <button className="scroll-arrow scroll-arrow-right" onClick={() => scrollProjects('right')}>
                            <i className="fas fa-chevron-right"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Feedback */}
                {result.recommendations && result.recommendations.length > 0 && (
                  <div className="card fade-in-up">
                    <div className="card-body p-4">
                      <div className="section-header">
                        <i className="fas fa-comments"></i>
                        <h4>Feedback</h4>
                      </div>
                      {result.recommendations.map((rec, i) => (
                        <div key={i} className="recommendation-item">
                          <i className="fas fa-arrow-right text-primary me-2"></i>
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Learning Roadmap */}
                {roadmap && (
                  <div className="card fade-in-up">
                    <div className="card-header">
                      <h3><i className="fas fa-route"></i> Learning Roadmap</h3>
                    </div>
                    <div className="card-body p-4">
                      {/* View Roadmap Button */}
                      <div className="text-center mb-4">
                        <button className="btn btn-primary btn-lg" type="button" onClick={toggleRoadmap}>
                          <i className={showRoadmap ? 'fas fa-eye-slash' : 'fas fa-eye'}></i> {showRoadmap ? 'Hide Roadmap' : 'View Roadmap'}
                        </button>
                      </div>

                      {/* Full Roadmap Content */}
                      {showRoadmap && (
                        <div id="roadmapContent">
                          <div className="mb-4">
                            <h4 className="text-primary mb-3">{roadmap.roadmap_title}</h4>
                            <p className="mb-3">{roadmap.overview}</p>
                            <div className="row g-3 mb-4">
                              <div className="col-md-4">
                                <div className="summary-box text-center">
                                  <i className="fas fa-calendar-alt text-primary mb-2" style={{ fontSize: '2rem' }}></i>
                                  <h5 className="mb-1">{roadmap.total_duration_weeks} Weeks</h5>
                                  <p className="mb-0 text-muted">Total Duration</p>
                                </div>
                              </div>
                              <div className="col-md-4">
                                <div className="summary-box text-center">
                                  <i className="fas fa-clock text-primary mb-2" style={{ fontSize: '2rem' }}></i>
                                  <h5 className="mb-1">{roadmap.study_hours_per_day} hrs/day</h5>
                                  <p className="mb-0 text-muted">Study Time</p>
                                </div>
                              </div>
                              <div className="col-md-4">
                                <div className="summary-box text-center">
                                  <i className="fas fa-hourglass-half text-primary mb-2" style={{ fontSize: '2rem' }}></i>
                                  <h5 className="mb-1">{roadmap.study_hours_per_week} hrs/week</h5>
                                  <p className="mb-0 text-muted">Weekly Commitment</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Phases */}
                          {roadmap.phases && roadmap.phases.length > 0 && (
                            <div className="mb-4">
                              <h5 className="mb-3"><i className="fas fa-list-ol text-primary"></i> Learning Phases</h5>
                              {roadmap.phases.map((phase, i) => (
                                <div key={i} className="card mb-3" style={{ borderLeft: '4px solid var(--royal-blue)' }}>
                                  <div className="card-body">
                                    <h5 className="text-primary mb-2">
                                      Phase {phase.phase_number}: {phase.phase_name}
                                      <span className="badge bg-primary ms-2">{phase.duration_weeks} weeks</span>
                                    </h5>
                                    <p className="mb-3">{phase.description}</p>
                                    
                                    {phase.learning_objectives && phase.learning_objectives.length > 0 && (
                                      <div className="mb-3">
                                        <strong><i className="fas fa-bullseye text-primary"></i> Learning Objectives:</strong>
                                        <ul className="mt-2">
                                          {phase.learning_objectives.map((obj, j) => (
                                            <li key={j}>{obj}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    
                                    {phase.skills_covered && phase.skills_covered.length > 0 && (
                                      <div className="mb-3">
                                        <strong><i className="fas fa-check-circle text-success"></i> Skills Covered:</strong>
                                        <div className="mt-2">
                                          {phase.skills_covered.map((skill, j) => (
                                            <span key={j} className="skill-badge skill-match">{skill}</span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {phase.resources && phase.resources.length > 0 && (
                                      <div className="mb-3">
                                        <strong><i className="fas fa-book text-info"></i> Resources:</strong>
                                        <ul className="mt-2">
                                          {phase.resources.map((resource, j) => (
                                            <li key={j}>
                                              <strong>{resource.type ? resource.type.charAt(0).toUpperCase() + resource.type.slice(1) : 'Resource'}:</strong> {resource.title}
                                              {resource.estimated_hours && (
                                                <span className="text-muted"> ({resource.estimated_hours} hours)</span>
                                              )}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    
                                    {phase.projects && phase.projects.length > 0 && (
                                      <div className="mb-3">
                                        <strong><i className="fas fa-code text-warning"></i> Projects:</strong>
                                        <ul className="mt-2">
                                          {phase.projects.map((project, j) => (
                                            <li key={j}>
                                              <strong>{project.title}</strong> - 
                                              <span className={`difficulty-badge difficulty-${project.difficulty}`}>
                                                {project.difficulty ? project.difficulty.charAt(0).toUpperCase() + project.difficulty.slice(1) : 'Intermediate'}
                                              </span>
                                              {project.estimated_hours && (
                                                <span className="text-muted"> ({project.estimated_hours} hours)</span>
                                              )}
                                              <p className="mb-0 mt-1" style={{ fontSize: '0.9rem' }}>{project.description}</p>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    
                                    {phase.milestones && phase.milestones.length > 0 && (
                                      <div>
                                        <strong><i className="fas fa-flag-checkered text-success"></i> Milestones:</strong>
                                        <ul className="mt-2">
                                          {phase.milestones.map((milestone, j) => (
                                            <li key={j}>{milestone}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Interview Preparation */}
                          {roadmap.interview_preparation && (
                            <div className="card mb-4" style={{ borderLeft: '4px solid var(--cyan)' }}>
                              <div className="card-body">
                                <h5 className="text-primary mb-3">
                                  <i className="fas fa-user-tie"></i> Interview Preparation
                                  <span className="badge bg-primary ms-2">{roadmap.interview_preparation.timeline_weeks} weeks</span>
                                </h5>
                                
                                {roadmap.interview_preparation.topics && roadmap.interview_preparation.topics.length > 0 && (
                                  <div className="mb-3">
                                    <strong>Topics to Cover:</strong>
                                    <ul className="mt-2">
                                      {roadmap.interview_preparation.topics.map((topic, i) => (
                                        <li key={i}>{topic}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {roadmap.interview_preparation.practice_resources && roadmap.interview_preparation.practice_resources.length > 0 && (
                                  <div className="mb-3">
                                    <strong>Practice Resources:</strong>
                                    <ul className="mt-2">
                                      {roadmap.interview_preparation.practice_resources.map((resource, i) => (
                                        <li key={i}>
                                          <strong>{resource.name}</strong> - {resource.description}
                                          {resource.url && (
                                            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="ms-2">
                                              <i className="fas fa-external-link-alt"></i>
                                            </a>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {roadmap.interview_preparation.mock_interview_schedule && (
                                  <div>
                                    <strong>Mock Interview Schedule:</strong>
                                    <p className="mb-0 mt-2">{roadmap.interview_preparation.mock_interview_schedule}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Key Takeaways */}
                          {roadmap.key_takeaways && roadmap.key_takeaways.length > 0 && (
                            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(65, 105, 225, 0.1), rgba(6, 182, 212, 0.1))' }}>
                              <div className="card-body">
                                <h5 className="text-primary mb-3"><i className="fas fa-star"></i> Key Takeaways</h5>
                                <ul>
                                  {roadmap.key_takeaways.map((takeaway, i) => (
                                    <li key={i} className="mb-2">{takeaway}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Download Section */}
                {result && !result.error && (
                  <div className="card fade-in-up" style={{ background: 'var(--accent-gradient)', border: 'none' }}>
                    <div className="card-body p-4 text-center text-white">
                      <h4 className="mb-4"><i className="fas fa-download"></i> Download Reports</h4>
                      <div className="d-flex justify-content-center gap-3 flex-wrap">
                        {roadmap && (
                          <button className="btn btn-light btn-lg" onClick={downloadRoadmap} style={{ minWidth: '200px' }}>
                            <i className="fas fa-route"></i> Download Roadmap PDF
                          </button>
                        )}
                        <button className="btn btn-light btn-lg" onClick={downloadCompleteReport} style={{ minWidth: '200px' }}>
                          <i className="fas fa-file-pdf"></i> Download Complete Report PDF
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="footer">
        <div className="container">
          <p className="mb-0">
            <i className="#"></i> AI - POWERED RESUME ANALYZER;
          </p>
        </div>
      </div>
    </>
  );
};

export default AnalyzerPage;
