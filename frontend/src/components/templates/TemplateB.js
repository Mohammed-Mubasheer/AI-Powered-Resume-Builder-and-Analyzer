import React from 'react';
import './TemplateB.css';
import { LinkedinFilled,
   GithubFilled,
   MailFilled,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const TemplateB = ({ data, accentColor, targetProfile }) => {

    // 1. SETTINGS
    const themeColor = '#d0e0e3'; // Pastel Blue fixed

    // Ensures the link always starts with https://
const ensureUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
};

    // 2. HELPERS
    const formatDate = (date) => {
        if (!date) return '';
        return dayjs(date).isValid() ? dayjs(date).format('MMM YYYY') : date;
    };

    // Helper for ranges (Start - End)
    const formatDateRange = (start, end, current) => {
        const startDate = formatDate(start);
        const endDate = current ? 'Present' : formatDate(end);
        
        if (!startDate && !endDate) return '';
        if (startDate && !endDate) return startDate; 
        if (!startDate && endDate) return endDate;
        
        return `${startDate} - ${endDate}`;
    };

    const formatLink = (url) => url ? url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : '';

    const formatLinkedIn = (url) => {
        const match = url?.match(/in\/([^/]+)/);
        return match ? `in/${match[1]}` : formatLink(url);
    };

    const formatGitHub = (url) => {
        // Tries to grab just the username if it's a standard github url
        const match = url?.match(/github\.com\/([^/]+)/);
        return match ? `github.com/${match[1]}` : formatLink(url);
    };

    const renderList = (desc) => {
        if (!desc) return null;
        const lines = desc.split(/\n|•/).filter(line => line.trim().length > 0);
        return (
            <ul className="template-b-list">
                {lines.map((line, idx) => <li key={idx}>{line.trim()}</li>)}
            </ul>
        );
    };

    // =========================================================================
    // 3. DEFINE BLOCKS
    // =========================================================================

    const ExperienceBlock = data?.experience?.length > 0 && (
        <div className="template-b-section">
            <div className="template-b-section-title" style={{ backgroundColor: themeColor }}>
                WORK EXPERIENCE
            </div>
            {data.experience.map((exp, i) => (
                <div key={i} className="template-b-item">
                    {/* Title | Company | Location (Left) ... Date (Right) */}
                    <div className="template-b-row">
                        <span className="template-b-main-text">
                            {exp.title} 
                            {exp.company ? ` | ${exp.company}` : ''}
                            {/* ADDED LOCATION HERE */}
                            {exp.location ? ` | ${exp.location}` : ''}
                        </span>
                        <span className="template-b-date">
                            {formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking)}
                        </span>
                    </div>
                    {renderList(exp.description)}
                </div>
            ))}
        </div>
    );

    const ProjectsBlock = data?.projects?.length > 0 && (
        <div className="template-b-section">
            <div className="template-b-section-title" style={{ backgroundColor: themeColor }}>
                PROJECTS
            </div>
            {data.projects.map((proj, i) => (
                <div key={i} className="template-b-item">
                    <div className="template-b-row">
                        <span className="template-b-main-text">
                            {proj.name} {proj.type ? `| ${proj.type}` : ''}
                        </span>
                        {/* UPDATED: Now shows Start - End range */}
                        <span className="template-b-date">
                            {formatDateRange(proj.startDate, proj.endDate, proj.currentlyWorking)}
                        </span>
                    </div>
                    {renderList(proj.description)}
                </div>
            ))}
        </div>
    );

    const EducationBlock = data?.education?.length > 0 && (
        <div className="template-b-section">
            <div className="template-b-section-title" style={{ backgroundColor: themeColor }}>
                EDUCATION
            </div>
            {data.education.map((edu, i) => (
                <div key={i} className="template-b-item">
                    <div className="template-b-row">
                        <span className="template-b-main-text">
                            {edu.degree} | {edu.institutionName}
                        </span>
                        <span className="template-b-date">
                            {formatDate(edu.date)}
                        </span>
                    </div>
                    <ul className="template-b-list">
                        {edu.fieldOfStudy && <li>Major in {edu.fieldOfStudy}</li>}
                        {edu.gpa && <li>GPA: {edu.gpa}</li>}
                    </ul>
                </div>
            ))}
        </div>
    );

    // SKILLS: Split into 2 Columns
    const SkillsBlock = data?.skills?.length > 0 && (() => {
        const mid = Math.ceil(data.skills.length / 2);
        const col1 = data.skills.slice(0, mid);
        const col2 = data.skills.slice(mid);

        return (
            <div className="template-b-section">
                <div className="template-b-section-title" style={{ backgroundColor: themeColor }}>
                    TECHNICAL SKILLS
                </div>
                <div className="template-b-skills-container">
                    <div className="template-b-skill-col">
                        <ul className="template-b-skill-list">
                            {col1.map((skill, idx) => <li key={idx}>{skill.name}</li>)}
                        </ul>
                    </div>
                    <div className="template-b-skill-col">
                        <ul className="template-b-skill-list">
                            {col2.map((skill, idx) => <li key={idx}>{skill.name}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
        );
    })();

    const CertificatesBlock = data?.certificates?.length > 0 && (
        <div className="template-b-section">
            <div className="template-b-section-title" style={{ backgroundColor: themeColor }}>
                AWARDS & ACHIEVEMENTS
            </div>
            <ul className="template-b-list">
                {data.certificates.map((cert, i) => (
                    <li key={i}>
                        {cert.name}, {cert.issuer} ({dayjs(cert.date).format('YYYY')})
                    </li>
                ))}
            </ul>
        </div>
    );

    // =========================================================================
    // 4. ORDER LOGIC
    // =========================================================================

    let LayoutContent;

    if (targetProfile === 'intern' || targetProfile === 'fresher') {
        LayoutContent = <>{SkillsBlock}{EducationBlock}{ProjectsBlock}{ExperienceBlock}{CertificatesBlock}</>;
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
        // Default "Experienced" order
        LayoutContent = <>{ExperienceBlock}{ProjectsBlock}{SkillsBlock}{EducationBlock}{CertificatesBlock}</>;
    }

    // =========================================================================
    // 5. RENDER
    // =========================================================================

    return (
        <div className="template-b-container">
            {/* Header */}
            <header className="template-b-header">
                <div className="template-b-name">
                    {data?.personalInfo?.name || "GRACE VICTORIA"}
                </div>
                
                <div className="template-b-contact">
                    {[
                        data?.personalInfo?.location,
                        data?.personalInfo?.email && (<span><MailFilled style={{fontSize: '11px'}} /><a href={`mailto:${data.personalInfo.email}`} target="_blank" rel="noreferrer">{data.personalInfo.email}</a> | </span>
                    ),
                        data?.personalInfo?.linkedin && (
    <span>
        <LinkedinFilled style={{ fontSize: '11px' }} />
        {/* href uses ensureUrl(), text uses formatLinkedIn() */}
        <a href={ensureUrl(data.personalInfo.linkedin)} target="_blank" rel="noreferrer">
            {formatLinkedIn(data.personalInfo.linkedin)}
        </a>
    </span>
),
                        data?.personalInfo?.website && (
    <span>
        <GithubFilled style={{ fontSize: '11px' }} />
        <a href={ensureUrl(data.personalInfo.website)} target="_blank" rel="noreferrer">
            {formatGitHub(data.personalInfo.website)}
        </a>
    </span>
),
                    ].filter(Boolean).map((item, i, arr) => (
                        <React.Fragment key={i}>
                            {item}
                            {i < arr.length - 1 && <span> | </span>}
                        </React.Fragment>
                    ))}
                </div>

                {data?.personalInfo?.profession && (
                    <div className="template-b-role">{data.personalInfo.profession}</div>
                )}
            </header>

            {/* Summary */}
            {data?.summary && (
                <div style={{ textAlign: 'center', marginBottom: '20px', padding: '0 20px' }}>
                    {data.summary}
                </div>
            )}

            {/* Content */}
            {LayoutContent}
        </div>
    );
};

export default TemplateB;