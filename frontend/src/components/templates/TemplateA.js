import React from 'react';
import './TemplateA.css';
import dayjs from 'dayjs';
import { 
    EnvironmentFilled, 
    MailFilled, 
    PhoneFilled, 
    LinkedinFilled, 
   GithubFilled,
} from '@ant-design/icons';

const TemplateA = ({ data, targetProfile }) => {

    // 1. SETTINGS
    // Rezi style uses dark slate/black. We ignore accentColor to keep it strict.
    const themeColor = '#2e3e4e';

    // Ensures the link always starts with https://
const ensureUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
};

    // 2. HELPERS
    const formatDate = (date) => {
        if (!date) return '';
        return dayjs(date).isValid() ? dayjs(date).format('MMMM YYYY') : date;
    };
    
    // Output: "August 2015 — Present" (using the long dash from screenshot)
    const formatDateRange = (start, end, current) => {
        const startDate = formatDate(start);
        const endDate = current ? 'Present' : formatDate(end);
        if (!startDate && !endDate) return '';
        return `${startDate} — ${endDate}`;
    };

    const formatLink = (url) => url ? url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : '';
    
    const formatLinkedIn = (url) => {
        const match = url?.match(/in\/([^/]+)/);
        return match ? `in/${match[1]}` : formatLink(url);
    };
    // Helper to make GitHub look clean (e.g. "github.com/username" or just "username")
    const formatGitHub = (url) => {
        // Tries to grab just the username if it's a standard github url
        const match = url?.match(/github\.com\/([^/]+)/);
        return match ? `github.com/${match[1]}` : formatLink(url);
    };

    // =========================================================================
    // 3. DEFINE BLOCKS (Structure matches Charles Bloomberg screenshot)
    // =========================================================================

    const ExperienceBlock = data?.experience?.length > 0 && (
        <div className="template-a-section">
            <div className="template-a-section-title">EXPERIENCE</div>
            {data.experience.map((exp, i) => (
                <div key={i} className="template-a-item">
                    {/* Row 1: Job Title (Bold) */}
                    <div className="template-a-row-title">
                        {exp.title}
                    </div>
                    
                    {/* Row 2: Company (Left) --- Date, Location (Right) */}
                    <div className="template-a-row-details">
                        <span className="template-a-company">{exp.company}</span>
                        <span className="template-a-date-loc">
                            {formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking)}
                            {exp.location && `, ${exp.location}`}
                        </span>
                    </div>

                    {/* Bullets */}
                    {exp.description && (
                        <ul className="template-a-list">
                            {exp.description.split('\n').map((line, idx) => line.trim() && <li key={idx}>{line}</li>)}
                        </ul>
                    )}
                </div>
            ))}
        </div>
    );

    const ProjectsBlock = data?.projects?.length > 0 && (
        <div className="template-a-section">
            <div className="template-a-section-title">PROJECT</div>
            {data.projects.map((proj, i) => (
                <div key={i} className="template-a-item">
                    {/* Row 1: Project Name (Bold) */}
                    <div className="template-a-row-title">
                        {proj.name}
                    </div>
                    
                    {/* Row 2: Role/Type (Left) --- Date (Right) */}
                    <div className="template-a-row-details">
                        <span className="template-a-company">{proj.type}</span> 
                        <span className="template-a-date-loc">
                            {formatDateRange(proj.startDate, proj.endDate, proj.currentlyWorking)}
                        </span>
                    </div>

                    {proj.description && (
                        <ul className="template-a-list">
                            {proj.description.split('\n').map((line, idx) => line.trim() && <li key={idx}>{line}</li>)}
                        </ul>
                    )}
                </div>
            ))}
        </div>
    );

    const EducationBlock = data?.education?.length > 0 && (
        <div className="template-a-section">
            <div className="template-a-section-title">EDUCATION</div>
            {data.education.map((edu, i) => (
                <div key={i} className="template-a-item">
                    {/* Row 1: Degree (Bold) */}
                    <div className="template-a-row-title">
                        {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                    </div>
                    
                    {/* Row 2: University (Left) --- Year/Location (Right) */}
                    <div className="template-a-row-details">
                        <span className="template-a-company">{edu.institutionName}</span>
                        <span className="template-a-date-loc">{formatDate(edu.date)}</span> 
                    </div>
                    
                    {/* GPA Line if exists */}
                    {edu.gpa && <div style={{ fontSize: '10pt', marginTop: '2px' }}>GPA: {edu.gpa}</div>}
                </div>
            ))}
        </div>
    );

    const SkillsBlock = data?.skills?.length > 0 && (
        <div className="template-a-section">
            <div className="template-a-section-title">SKILLS</div>
            <div className="template-a-skills-text">
                {/* If you want categorized skills like the screenshot (Leadership: ..., Front End: ...),
                   you would need a categorized data structure. 
                   For now, we render them as a comma-separated list to match the look.
                */}
                <span style={{ fontWeight: 'bold' }}>Skills: </span>
                {data.skills.map(s => s.name).join(', ')}
            </div>
        </div>
    );

    const CertificatesBlock = data?.certificates?.length > 0 && (
        <div className="template-a-section">
            <div className="template-a-section-title">CERTIFICATES</div>
            {data.certificates.map((cert, i) => (
                <div key={i} className="template-a-item">
                    <div className="template-a-row-title">{cert.name}</div>
                    <div className="template-a-row-details">
                        <span>{cert.issuer}</span>
                        <span>{formatDate(cert.date)}</span>
                    </div>
                </div>
            ))}
        </div>
    );

    // =========================================================================
    // 4. ORDER LOGIC (PRESERVED)
    // =========================================================================

    let LayoutContent;

    if (targetProfile === 'intern' || targetProfile === 'fresher') {
        LayoutContent = (
            <>
                {EducationBlock}
                {SkillsBlock}
                {ProjectsBlock}
                {ExperienceBlock}
                {CertificatesBlock}
            </>
        );
    } 
    else if (targetProfile === 'technical') {
        LayoutContent = (
            <>
                {SkillsBlock}
                {ProjectsBlock}
                {ExperienceBlock}
                {EducationBlock}
                {CertificatesBlock}
            </>
        );
    } 
    else if (targetProfile === 'switch') {
         LayoutContent = (
            <>
                {SkillsBlock}
                {ProjectsBlock}
                {ExperienceBlock}
                {CertificatesBlock}
                {EducationBlock}
            </>
        );
    }
    else {
        // Experienced / Default
        LayoutContent = (
            <>
                {ExperienceBlock}
                {ProjectsBlock}
                {EducationBlock}
                {SkillsBlock}
                {CertificatesBlock}
            </>
        );
    }

    // =========================================================================
    // 5. FINAL RENDER
    // =========================================================================

    return (
        <div className="template-a-container">
            
            {/* HEADER */}
            <header className="template-a-header">
                <h1 className="template-a-name">
                    {data?.personalInfo?.name || "Charles Bloomberg"}
                </h1>
                
                <div className="template-a-contact">
                    {data?.personalInfo?.location && (
                        <span><EnvironmentFilled style={{ fontSize: '11px' }} />{data.personalInfo.location}</span>
                    )}
                    
                    {data?.personalInfo?.email && (
                        <span><MailFilled style={{ fontSize: '11px' }} /><a href={`mailto:${data.personalInfo.email}`}>{data.personalInfo.email}</a></span>
                    )}
                    
                    {data?.personalInfo?.phone && (
                        <span><PhoneFilled style={{ fontSize: '11px' }} />{data.personalInfo.phone}</span>
                    )}
                    
                    {/* LinkedIn */}
{data?.personalInfo?.linkedin && (
    <span>
        <LinkedinFilled style={{ fontSize: '11px' }} />
        {/* href uses ensureUrl(), text uses formatLinkedIn() */}
        <a href={ensureUrl(data.personalInfo.linkedin)} target="_blank" rel="noreferrer">
            {formatLinkedIn(data.personalInfo.linkedin)}
        </a>
    </span>
)}

{/* GitHub / Website */}
{data?.personalInfo?.website && (
    <span>
        <GithubFilled style={{ fontSize: '11px' }} />
        <a href={ensureUrl(data.personalInfo.website)} target="_blank" rel="noreferrer">
            {formatGitHub(data.personalInfo.website)}
        </a>
    </span>
)}
                </div>
                
                {/* Horizontal Rule under header */}
                <hr style={{ marginTop: '15px', border: 'none', borderBottom: '1px solid #ccc' }} />
            </header>

            {/* SUMMARY */}
            {data?.summary && (
                <div className="template-a-section">
                    <div className="template-a-section-title">PROFESSIONAL SUMMARY</div>
                    <div className="template-a-skills-text">
                        {data.summary}
                    </div>
                </div>
            )}

            {/* SECTIONS */}
            {LayoutContent}

        </div>
    );
};

export default TemplateA;