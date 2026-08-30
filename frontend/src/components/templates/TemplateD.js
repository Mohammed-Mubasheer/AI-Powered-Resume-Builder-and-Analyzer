import React from 'react';
import './TemplateD.css';
import dayjs from 'dayjs';
import { LinkedinFilled, GithubFilled, MailFilled } from '@ant-design/icons';

const TemplateD = ({ data, accentColor, targetProfile }) => {

    // 1. SETTINGS
    const themeColor = '#1a5c40'; // Forest Green Fixed

    // Ensures the link always starts with https://
const ensureUrl = (url) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
};

    // 2. HELPERS
    const formatDate = (date) => {
        if (!date) return '';
        // Screenshot uses full month year: "October 2023"
        return dayjs(date).isValid() ? dayjs(date).format('MMMM YYYY') : date;
    };

    const formatDateRange = (start, end, current) => {
        const startDate = formatDate(start);
        const endDate = current ? 'Present' : formatDate(end);
        if (!startDate && !endDate) return '';
        return `${startDate} - ${endDate}`;
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
            <ul className="template-d-list">
                {lines.map((line, idx) => <li key={idx}>{line.trim()}</li>)}
            </ul>
        );
    };

    // =========================================================================
    // 3. DEFINE BLOCKS (Matches "Adam Gregory" Design)
    // =========================================================================

    const ExperienceBlock = data?.experience?.length > 0 && (
        <div className="template-d-section">
            <div className="template-d-section-title">WORK EXPERIENCE</div>
            {data.experience.map((exp, i) => (
                <div key={i} className="template-d-item">
                    <div className="template-d-job-title">
                        {exp.title}
                    </div>
                    <div className="template-d-company">
                        {exp.company}
                        {exp.location ? `, ${exp.location}` : ''}
                    </div>
                    <div className="template-d-date">
                        {formatDateRange(exp.startDate, exp.endDate, exp.currentlyWorking)}
                    </div>
                    {renderList(exp.description)}
                </div>
            ))}
        </div>
    );

    const ProjectsBlock = data?.projects?.length > 0 && (
        <div className="template-d-section">
            <div className="template-d-section-title">PROJECTS</div>
            {data.projects.map((proj, i) => (
                <div key={i} className="template-d-item">
                    <div className="template-d-job-title">
                        {proj.name}
                    </div>
                    <div className="template-d-company">
                        {proj.type}
                    </div>
                    <div className="template-d-date">
                        {formatDateRange(proj.startDate, proj.endDate, proj.currentlyWorking)}
                    </div>
                    {renderList(proj.description)}
                </div>
            ))}
        </div>
    );

    const EducationBlock = data?.education?.length > 0 && (
        <div className="template-d-section">
            <div className="template-d-section-title">EDUCATIONAL HISTORY</div>
            {data.education.map((edu, i) => (
                <div key={i} className="template-d-item">
                    <div className="template-d-job-title">
                        {edu.degree}
                    </div>
                    <div className="template-d-company">
                        {edu.institutionName}
                    </div>
                    <div className="template-d-date">
                        {formatDate(edu.date)}
                    </div>
                    {edu.fieldOfStudy && <div>Major: {edu.fieldOfStudy}</div>}
                    {edu.gpa && <div>GPA: {edu.gpa}</div>}
                </div>
            ))}
        </div>
    );

    // SKILLS: 2-Column Split
    const SkillsBlock = data?.skills?.length > 0 && (() => {
        const mid = Math.ceil(data.skills.length / 2);
        const col1 = data.skills.slice(0, mid);
        const col2 = data.skills.slice(mid);

        return (
            <div className="template-d-section">
                <div className="template-d-section-title">RELEVANT SKILLS</div>
                <div className="template-d-skills-container">
                    <div className="template-d-skill-col">
                        <ul className="template-d-skill-list">
                            {col1.map((skill, idx) => <li key={idx}>{skill.name}</li>)}
                        </ul>
                    </div>
                    <div className="template-d-skill-col">
                        <ul className="template-d-skill-list">
                            {col2.map((skill, idx) => <li key={idx}>{skill.name}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
        );
    })();

    const CertificatesBlock = data?.certificates?.length > 0 && (
        <div className="template-d-section">
            <div className="template-d-section-title">AWARDS & CERTIFICATIONS</div>
            {data.certificates.map((cert, i) => (
                <div key={i} className="template-d-item">
                    <div className="template-d-job-title">
                        {cert.name}
                    </div>
                    <div className="template-d-company">
                        {cert.issuer}
                    </div>
                    <div className="template-d-date">
                        {formatDate(cert.date)}
                    </div>
                </div>
            ))}
        </div>
    );

    // =========================================================================
    // 4. ORDER LOGIC
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
    // 5. RENDER
    // =========================================================================

    return (
        <div className="template-d-container">
            {/* Header */}
            <header className="template-d-header">
                <div className="template-d-header-left">
                    <div className="template-d-name">
                        {data?.personalInfo?.name || "ADAM GREGORY"}
                    </div>
                    {data?.personalInfo?.profession && (
                        <div className="template-d-role">
                            {data.personalInfo.profession}
                        </div>
                    )}
                </div>

                <div className="template-d-header-right">
                    {data?.personalInfo?.phone && <div>{data.personalInfo.phone}</div>}
                    {data?.personalInfo?.email && <div><MailFilled style={{ fontSize: '11px' }} /> <a href={`mailto:${data.personalInfo.email}`}>{data.personalInfo.email}</a></div>}
                    {data?.personalInfo?.location && <div>{data.personalInfo.location}</div>}
                    
                    {data?.personalInfo?.linkedin && (
    <div>
        <LinkedinFilled style={{ color: themeColor, marginRight: '5px' }} />
        <a href={ensureUrl(data.personalInfo.linkedin)} target="_blank" rel="noreferrer">
            {formatLinkedIn(data.personalInfo.linkedin)}
        </a>
    </div>
)}
 {data?.personalInfo?.website && (
    <div>
        <GithubFilled style={{ color: themeColor, marginRight: '5px' }} />
        <a href={ensureUrl(data.personalInfo.website)} target="_blank" rel="noreferrer">
            {formatLink(data.personalInfo.website)}
        </a>
    </div>
)}
                </div>
            </header>

            {/* Summary (Bar Style) */}
            {data?.summary && (
                <div className="template-d-summary-container">
                    {data.summary}
                </div>
            )}

            {/* Dynamic Content */}
            {LayoutContent}
        </div>
    );
};

export default TemplateD;