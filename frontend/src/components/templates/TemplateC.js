import React from 'react';
import './TemplateC.css';
import dayjs from 'dayjs';
import { MailFilled, PhoneFilled, LinkedinFilled, GithubFilled } from '@ant-design/icons';

const TemplateC = ({ data, targetProfile }) => {

    // Ensures the link always starts with https://
const ensureUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
};

    // 1. HELPERS
    const formatDate = (date) => {
        if (!date) return '';
        // Screenshot shows year only mostly, or simple format
        return dayjs(date).isValid() ? dayjs(date).format('MMM YYYY') : date;
    };

    const formatDateRange = (start, end, current) => {
        const startDate = formatDate(start);
        const endDate = current ? 'Present' : formatDate(end);
        
        if (!startDate && !endDate) return '';
        if (startDate && !endDate) return startDate; 
        if (!startDate && endDate) return endDate;
        
        return `${startDate} - ${endDate}`;
    };

    const formatLink = (url) => url ? url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : '';

    // Helper to make LinkedIn look clean
    const formatLinkedIn = (url) => {
        const match = url?.match(/in\/([^/]+)/);
        return match ? `in/${match[1]}` : formatLink(url);
    };

    // Helper to make GitHub look clean
    const formatGitHub = (url) => {
        const match = url?.match(/github\.com\/([^/]+)/);
        return match ? `github.com/${match[1]}` : formatLink(url);
    };

    const renderList = (desc) => {
        if (!desc) return null;
        const lines = desc.split(/\n|•/).filter(line => line.trim().length > 0);
        return (
            <ul className="template-c-list">
                {lines.map((line, idx) => <li key={idx}>{line.trim()}</li>)}
            </ul>
        );
    };

    // =========================================================================
    // 2. DEFINE BLOCKS (Timeline Design matches Isaac Daniel)
    // =========================================================================

    const ExperienceBlock = data?.experience?.length > 0 && (
        <div className="template-c-section">
            <div className="template-c-section-title">Experience</div>
            <div className="template-c-timeline">
                {data.experience.map((exp, i) => (
                    <div key={i} className="template-c-item">
                        {/* The Dot */}
                        <div className="template-c-dot"></div>
                        
                        {/* Title (Bold) ... Date (Italic) */}
                        <div className="template-c-row">
                            <span className="template-c-main-text">{exp.title}</span>
                            <span className="template-c-date">
                                {formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking)}
                            </span>
                        </div>
                        <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>
                            {exp.company}
                            {exp.location ? `, ${exp.location}` : ''} 
                        </div>

                        
                        {/* Bullets */}
                        {renderList(exp.description)}
                    </div>
                ))}
            </div>
        </div>
    );

    const ProjectsBlock = data?.projects?.length > 0 && (
        <div className="template-c-section">
            <div className="template-c-section-title">Projects</div>
            <div className="template-c-timeline">
                {data.projects.map((proj, i) => (
                    <div key={i} className="template-c-item">
                        <div className="template-c-dot"></div>
                        <div className="template-c-row">
                            <span className="template-c-main-text">{proj.name}</span>
                            <span className="template-c-date">
                                {formatDateRange(proj.startDate, proj.endDate, proj.currentlyWorking)}
                            </span>
                        </div>
                        <div style={{ fontStyle: 'italic', marginBottom: '5px' }}>{proj.type}</div>
                        {renderList(proj.description)}
                    </div>
                ))}
            </div>
        </div>
    );

    const EducationBlock = data?.education?.length > 0 && (
        <div className="template-c-section">
            <div className="template-c-section-title">Education</div>
            <div className="template-c-timeline">
                {data.education.map((edu, i) => (
                    <div key={i} className="template-c-item">
                        <div className="template-c-dot"></div>
                        <div className="template-c-row">
                            <span className="template-c-main-text">{edu.institutionName}</span>
                            <span className="template-c-date">{formatDate(edu.date)}</span>
                        </div>
                        <div>
                            {edu.degree} {edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}
                        </div>
                        {edu.gpa && <div style={{ fontSize: '10pt', color: '#666' }}>GPA: {edu.gpa}</div>}
                    </div>
                ))}
            </div>
        </div>
    );

    const SkillsBlock = data?.skills?.length > 0 && (() => {
        const mid = Math.ceil(data.skills.length / 2);
        const col1 = data.skills.slice(0, mid);
        const col2 = data.skills.slice(mid);

        return (
            <div className="template-c-section">
                <div className="template-c-section-title">Skills</div>
                <div className="template-c-skills-container">
                    <div className="template-c-skill-col">
                        <ul className="template-c-skill-list">
                            {col1.map((skill, idx) => <li key={idx}>{skill.name}</li>)}
                        </ul>
                    </div>
                    <div className="template-c-skill-col">
                        <ul className="template-c-skill-list">
                            {col2.map((skill, idx) => <li key={idx}>{skill.name}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
        );
    })();

    const CertificatesBlock = data?.certificates?.length > 0 && (
        <div className="template-c-section">
            <div className="template-c-section-title">Certifications</div>
            <div className="template-c-timeline">
                {data.certificates.map((cert, i) => (
                    <div key={i} className="template-c-item">
                        <div className="template-c-dot"></div>
                        <div className="template-c-row">
                            <span className="template-c-main-text">{cert.name}</span>
                            <span className="template-c-date">{formatDate(cert.date)}</span>
                        </div>
                        <div>{cert.issuer}</div>
                    </div>
                ))}
            </div>
        </div>
    );

    // =========================================================================
    // 3. ORDER LOGIC
    // =========================================================================

    let LayoutContent;

    if (targetProfile === 'intern' || targetProfile === 'fresher') {
        LayoutContent = <>{EducationBlock}{SkillsBlock}{ProjectsBlock}{ExperienceBlock}{CertificatesBlock}</>;
    } 
    else if (targetProfile === 'technical') {
        LayoutContent = <>{SkillsBlock}{ProjectsBlock}{ExperienceBlock}{EducationBlock}{CertificatesBlock}</>;
    } else if (targetProfile === 'switch') {
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
        // Default / Experienced
        LayoutContent = <>{ExperienceBlock}{ProjectsBlock}{SkillsBlock}{EducationBlock}{CertificatesBlock}</>;
    }

    // =========================================================================
    // 4. RENDER
    // =========================================================================

    return (
        <div className="template-c-container">
            {/* Header */}
            <header className="template-c-header">
                <div className="template-c-name">
                    {data?.personalInfo?.name || "Isaac Daniel"}
                </div>
                {data?.personalInfo?.profession && (
                    <div className="template-c-role">{data.personalInfo.profession}</div>
                )}
                
                <div className="template-c-contact">
                    {data?.personalInfo?.email && (
                        <span><MailFilled style={{fontSize: '11px'}} /> <a href={`mailto:${data.personalInfo.email}`}>{data.personalInfo.email}</a></span>
                    )}
                    {data?.personalInfo?.phone && (
                        <span><PhoneFilled style={{fontSize: '11px'}} /> {data.personalInfo.phone}</span>
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
            </header>

            {/* Summary */}
            {data?.summary && (
                <div className="template-c-summary">
                    {data.summary}
                </div>
            )}

            {/* Dynamic Content */}
            {LayoutContent}
        </div>
    );
};

export default TemplateC;