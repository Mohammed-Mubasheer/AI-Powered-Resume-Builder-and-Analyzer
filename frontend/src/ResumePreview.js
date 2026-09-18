import React, { forwardRef } from 'react';
import TemplateA from './templates/TemplateA'; 
import TemplateB from './templates/TemplateB'; 
import TemplateC from './templates/TemplateC'; 
import TemplateD from './templates/TemplateD';
import TemplateE from './templates/TemplateE';

const ResumePreview = forwardRef((props, ref) => {
    
    const { resumeData, templateId, accentColor, targetProfile } = props;

    // Data Cleaning
    let cleanData = {};
    try {
        if (resumeData) cleanData = JSON.parse(JSON.stringify(resumeData));
    } catch (e) { cleanData = {}; }

    // Helper: Sort Newest First
    const sortNewestFirst = (items) => {
        if (!items || !Array.isArray(items)) return [];
        return items.sort((a, b) => {
            const dateStrA = a.startDate || a.date; 
            const dateStrB = b.startDate || b.date;
            const dateA = dateStrA ? new Date(dateStrA).getTime() : 0;
            const dateB = dateStrB ? new Date(dateStrB).getTime() : 0;
            return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
        });
    };

    if (cleanData.experience) cleanData.experience = sortNewestFirst(cleanData.experience);
    if (cleanData.projects) cleanData.projects = sortNewestFirst(cleanData.projects);
    if (cleanData.education) cleanData.education = sortNewestFirst(cleanData.education);
    if (cleanData.certificates) cleanData.certificates = sortNewestFirst(cleanData.certificates);

    // Render Template
    const renderTemplate = () => {
        switch (templateId) {
            case 'classic': return <TemplateA data={cleanData} accentColor={accentColor} targetProfile={targetProfile} />;
            case 'modern': return <TemplateB data={cleanData} accentColor={accentColor} targetProfile={targetProfile} />;
            case 'minimalImage': return <TemplateC data={cleanData} accentColor={accentColor} targetProfile={targetProfile} />;
            case 'minimal': return <TemplateD data={cleanData} accentColor={accentColor} targetProfile={targetProfile} />;
            case 'New': return <TemplateE data={cleanData} accentColor={accentColor} targetProfile={targetProfile} />;
            default: return <TemplateA data={cleanData} accentColor={accentColor} targetProfile={targetProfile} />;
        }
    };

    return (
        <div 
            ref={ref} 
            id="resume-preview-id" 
            // === LOGIC UPDATE: Adds 'full-width' class only for Template E ===
            className={`resume-preview-container ${templateId === 'New' ? 'full-width' : ''}`}
        >
            {renderTemplate()}
        </div>
    );
});

export default ResumePreview;
