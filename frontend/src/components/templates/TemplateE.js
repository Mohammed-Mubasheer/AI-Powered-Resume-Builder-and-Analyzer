import React from 'react';
import './TemplateE.css';
import dayjs from 'dayjs';
import { 
    PhoneFilled, 
    MailFilled, 
    EnvironmentFilled, 
    LinkedinFilled,
    GithubFilled
} from '@ant-design/icons';

const TemplateE = ({ data, accentColor, targetProfile }) => {

    // 1. SETTINGS
    // Accent color is used for Dates in this design. 
    // Default is the Gold/Tan from screenshot (#c19b6c).
    const themeColor = accentColor || '#c19b6c';

    // Ensures the link always starts with https://
const ensureUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
};

    // 2. HELPERS
    const formatDate = (date) => {
        if (!date) return '';
        // Screenshot shows "20XX" or ranges
        return dayjs(date).isValid() ? dayjs(date).format('MMM YYYY') : date;
    };

    const formatDateRange = (start, end, current) => {
        const startDate = formatDate(start);
        const endDate = current ? 'Present' : formatDate(end);
        if (!startDate && !endDate) return '';
        return `${startDate} – ${endDate}`;
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

    const renderList = (desc) => {
        if (!desc) return null;
        const lines = desc.split(/\n|•/).filter(line => line.trim().length > 0);
        return (
            <ul className="template-e-list">
                {lines.map((line, idx) => <li key={idx}>{line.trim()}</li>)}
            </ul>
        );
    };

    // =========================================================================
    // 3. DEFINE BLOCKS (Right Column Content)
    // =========================================================================

    const ExperienceBlock = data?.experience?.length > 0 && (
        <div className="template-e-block">
            <div className="template-e-section-title">WORK EXPERIENCE</div>
            {data.experience.map((exp, i) => (
                <div key={i} className="template-e-item">
                    {/* Title ..... Date (Gold) */}
                    <div className="template-e-row-primary">
                        <span className="template-e-job-title">{exp.title}</span>
                        <span className="template-e-date" style={{ color: themeColor }}>
                            {formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking)}
                        </span>
                    </div>
                    {/* Company, Location */}
                    <div className="template-e-company">
                        {exp.company}{exp.location ? `, ${exp.location}` : ''}
                    </div>
                    {/* Bullets */}
                    {renderList(exp.description)}
                </div>
            ))}
        </div>
    );

    const ProjectsBlock = data?.projects?.length > 0 && (
        <div className="template-e-block">
            <div className="template-e-section-title">PROJECTS</div>
            {data.projects.map((proj, i) => (
                <div key={i} className="template-e-item">
                    <div className="template-e-row-primary">
                        <span className="template-e-job-title">{proj.name}</span>
                        <span className="template-e-date" style={{ color: themeColor }}>
                            {formatDateRange(proj.startDate, proj.endDate, proj.currentlyWorking)}
                        </span>
                    </div>
                    <div className="template-e-company">
                        {proj.type}
                    </div>
                    {renderList(proj.description)}
                </div>
            ))}
        </div>
    );

    const EducationBlock = data?.education?.length > 0 && (
        <div className="template-e-block">
            <div className="template-e-section-title">EDUCATION</div>
            {data.education.map((edu, i) => (
                <div key={i} className="template-e-item">
                    <div className="template-e-row-primary">
                        <span className="template-e-job-title">
                            {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
                        </span>
                        <span className="template-e-date" style={{ color: themeColor }}>
                            {formatDate(edu.date)}
                        </span>
                    </div>
                    <div className="template-e-company">
                        {edu.institutionName}
                    </div>
                    {edu.gpa && <div style={{ fontSize: '9.5pt', marginTop: '2px' }}>GPA: {edu.gpa}</div>}
                </div>
            ))}
        </div>
    );

    const CertificatesBlock = data?.certificates?.length > 0 && (
        <div className="template-e-block">
            <div className="template-e-section-title">CERTIFICATIONS</div>
            {data.certificates.map((cert, i) => (
                <div key={i} className="template-e-item">
                    <div className="template-e-row-primary">
                        <span className="template-e-job-title">{cert.name}</span>
                        <span className="template-e-date" style={{ color: themeColor }}>
                            {formatDate(cert.date)}
                        </span>
                    </div>
                    <div className="template-e-company">
                        {cert.issuer}
                    </div>
                </div>
            ))}
        </div>
    );

    // =========================================================================
    // 4. ORDER LOGIC (Main Column Only)
    // =========================================================================

    let MainContentLayout;

    if (targetProfile === 'intern' || targetProfile === 'fresher') {
        // Interns: Education top of right column
        MainContentLayout = <>{EducationBlock}{ProjectsBlock}{ExperienceBlock}{CertificatesBlock}</>;
    } 
    else if (targetProfile === 'technical') {
        // Tech: Projects top of right column
        MainContentLayout = <>{ProjectsBlock}{ExperienceBlock}{EducationBlock}{CertificatesBlock}</>;
    } else if (targetProfile === 'switch') {
         MainContentLayout = (
            <>
                {ProjectsBlock}
                {ExperienceBlock}
                {CertificatesBlock}
                {EducationBlock}
            </>
        );
    }
    else {
        // Default: Experience top of right column
        MainContentLayout = <>{ExperienceBlock}{ProjectsBlock}{EducationBlock}{CertificatesBlock}</>;
    }

    // =========================================================================
    // 5. RENDER
    // =========================================================================

    return (
        <div className="template-e-container">
            
            {/* === LEFT SIDEBAR === */}
            <aside className="template-e-sidebar">
                
                {/* Contact Info */}
                <div className="template-e-contact-section">
                    <h3>CONTACT</h3>
                    {data?.personalInfo?.phone && (
                        <div className="template-e-contact-item">
                            <PhoneFilled /> {data.personalInfo.phone}
                        </div>
                    )}
                    {data?.personalInfo?.location && (
                        <div className="template-e-contact-item">
                            <EnvironmentFilled /> {data.personalInfo.location}
                        </div>
                    )}
                    {data?.personalInfo?.email && (
                        <div className="template-e-contact-item">
                            <MailFilled /> <a href={`mailto:${data.personalInfo.email}`}>{data.personalInfo.email}</a>
                        </div>
                    )}
                    {data?.personalInfo?.linkedin && (
    <div className="template-e-contact-item">
        <LinkedinFilled /> 
        <a href={ensureUrl(data.personalInfo.linkedin)} target="_blank" rel="noreferrer">
            {formatLinkedIn(data.personalInfo.linkedin)}
        </a>
    </div>
)}
{data?.personalInfo?.website && (
    <div className="template-e-contact-item">
        <GithubFilled /> 
        <a href={ensureUrl(data.personalInfo.website)} target="_blank" rel="noreferrer">
            {formatLink(data.personalInfo.website)}
        </a>
    </div>
)}
                </div>

                {/* Summary */}
                {data?.summary && (
                    <div className="template-e-summary-section">
                        <h3>SUMMARY</h3>
                        <div className="template-e-summary">
                            {data.summary}
                        </div>
                    </div>
                )}

                {/* Skills (Fixed in Sidebar) */}
                {data?.skills?.length > 0 && (
                    <div className="template-e-skills-section">
                        <h3>SKILLS</h3>
                        <ul className="template-e-sidebar-list">
                            {data.skills.map((skill, index) => (
                                <li key={index}>{skill.name}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </aside>

            {/* === RIGHT MAIN COLUMN === */}
            <main className="template-e-main">
                
                {/* Header */}
                <header className="template-e-header">
                    <div className="template-e-name">
                        {data?.personalInfo?.name || "EMILY RICHARDS"}
                    </div>
                    {data?.personalInfo?.profession && (
                        <div className="template-e-role">
                            {data.personalInfo.profession}
                        </div>
                    )}
                </header>

                {/* Dynamic Main Content */}
                {MainContentLayout}
                
                {/* References (Hardcoded mockup or dynamic if you have data) */}
                {/* If you don't have a References array, we can omit it or add a placeholder */}

            </main>
        </div>
    );
};

export default TemplateE;