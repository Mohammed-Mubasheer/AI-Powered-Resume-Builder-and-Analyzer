// src/pages/BuilderPage.js
import React, { useState, useContext, useRef, useEffect, useCallback } from 'react';
import {
    Layout, Button, Space, Form, Modal, Input, List, Popover, App, Typography, Spin, Select, Tooltip
} from 'antd';
import {
    ArrowLeftOutlined, DownloadOutlined, EyeOutlined, CheckOutlined, 
    ShareAltOutlined, PlusOutlined, DeleteOutlined, EditOutlined, 
    FileTextOutlined, ExclamationCircleOutlined, HomeOutlined, SaveOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ResumeForm from '../components/ResumeForm';
import ResumePreview from '../components/ResumePreview';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import dayjs from 'dayjs';
import './BuilderPage.css'; // Import the new Premium Styles

const { Header, Content } = Layout;
const { Text } = Typography;

// --- Constants ---
const stepTitles = ['Personal Information', 'Professional Summary', 'Professional Experience', 'Education', 'Projects', 'Skills', 'Certifications'];

const initialData = {
    personalInfo: { name: "", email: "", phone: "", location: "", profession: "", linkedin: "", website: "" },
    summary: "", experience: [], education: [], skills: [], projects: [], certificates: []
};

const templateOptions = [
  { id: 'classic', name: 'Classic Professional', description: 'Clean & Traditional' },
  { id: 'modern', name: 'Modern Creative', description: 'Sleek & Bold' },
  { id: 'minimalImage', name: 'Elegant Executive', description: 'Image Focused' },
  { id: 'minimal', name: 'Bold Structure', description: 'Ultra Clean' },
  { id: 'New', name: 'Designer Sidebar', description: 'Compact & Structured' },
];

const profileOptions = [
    { id: 'intern', label: 'Internship', desc: 'Education & Projects first' },
    { id: 'fresher', label: 'Fresher', desc: 'Skills & Education focused' },
    { id: 'experienced', label: 'Experienced', desc: 'Work History first' },
    { id: 'technical', label: 'Technical / Dev', desc: 'Skills & Projects focused' },
    { id: 'switch', label: 'Career Switcher', desc: 'Summary & Skills focused' }
];

// --- Main Content Component ---
const BuilderPageContent = () => {
    const navigate = useNavigate();
    const { authTokens, logoutUser } = useContext(AuthContext);
    const [form] = Form.useForm();
    const resumeRef = useRef(null);
    
    const { message, modal } = App.useApp(); 

    // --- State Variables ---
    const [showEditor, setShowEditor] = useState(false); 
    const [resumesList, setResumesList] = useState([]);  
    const [listLoading, setListLoading] = useState(false);
    const [resumeId, setResumeId] = useState(null);
    const [resumeData, setResumeData] = useState(initialData);
    const [currentStep, setCurrentStep] = useState(0);
    const [templateId, setTemplateId] = useState('classic');
    const [isPublic, setIsPublic] = useState(false);
    
    // UI States
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [newResumeTitle, setNewResumeTitle] = useState("My Resume");
    const [templatePopoverVisible, setTemplatePopoverVisible] = useState(false);
    const [targetProfile, setTargetProfile] = useState('fresher');

    // Helper to restore date objects from API strings
    const restoreDates = (data) => {
        const newData = { ...data };
        const toDayjs = (dateStr) => (dateStr ? dayjs(dateStr) : null);

        if (newData.experience) {
            newData.experience = newData.experience.map(item => ({
                ...item,
                startDate: toDayjs(item.startDate),
                endDate: toDayjs(item.endDate),
            }));
        }
        if (newData.projects) {
            newData.projects = newData.projects.map(item => ({
                ...item,
                startDate: toDayjs(item.startDate),
                endDate: toDayjs(item.endDate),
            }));
        }
        if (newData.education) {
            newData.education = newData.education.map(item => ({
                ...item,
                date: toDayjs(item.date),
            }));
        }
        if (newData.certificates) {
            newData.certificates = newData.certificates.map(item => ({
                ...item,
                date: toDayjs(item.date),
            }));
        }
        return newData;
    };

    // --- 2. API FUNCTIONS ---
    const fetchResumesList = useCallback(async () => {
        setListLoading(true);
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/resumes/', { headers: { 'Authorization': `Bearer ${authTokens?.access}` } });
            setResumesList(response.data);
        } catch (error) { console.error(error); } finally { setListLoading(false); }
    }, [authTokens]);

    const fetchResumeAndRestore = useCallback(async (id) => {
        const hide = message.loading('Loading...', 0);
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/resumes/${id}/`, { headers: { 'Authorization': `Bearer ${authTokens?.access}` } });
            let fetchedData = response.data.resume_data || initialData;
            fetchedData = restoreDates(fetchedData); 
            if (fetchedData.targetProfile) setTargetProfile(fetchedData.targetProfile);
            else setTargetProfile('fresher');
            setResumeData(fetchedData);
            form.setFieldsValue(fetchedData);
            setResumeId(id);
            setNewResumeTitle(response.data.title);
            setIsPublic(response.data.is_public);
            setShowEditor(true); 
            hide();
        } catch (error) { hide(); console.error(error); }
    }, [authTokens, form, message]);

    // --- STABILIZED USE EFFECT ---
    useEffect(() => {
        const savedId = localStorage.getItem('currentResumeId');
        if (savedId) {
            fetchResumeAndRestore(savedId);
        } else {
            fetchResumesList();
            setShowEditor(false); 
        }
        // Depend only on the token string, not the object
    }, [authTokens?.access, fetchResumeAndRestore, fetchResumesList]);

    const handleDelete = async (id) => {
        message.loading({ content: 'Deleting...', key: 'delete' });
        try {
            await axios.delete(`http://127.0.0.1:8000/api/resumes/${id}/`, {
                headers: { 'Authorization': `Bearer ${authTokens?.access}` }
            });
            message.success({ content: 'Resume deleted', key: 'delete' });
            setResumesList(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            message.error({ content: 'Delete failed', key: 'delete' });
        }
    };

    const showDeleteConfirm = (id, title) => {
        modal.confirm({
            title: 'Delete Resume?',
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure you want to delete "${title || 'this resume'}"?`,
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            centered: true,
            maskClosable: true,
            onOk: async () => { await handleDelete(id); },
        });
    };

    const handleSave = async (shouldRedirect = false) => {
        const MSG_KEY = 'save_status';
        message.loading({ content: 'Saving...', key: MSG_KEY });

        const currentData = form.getFieldsValue();
        const finalData = { 
            ...currentData, 
            targetProfile: targetProfile 
        };

        const payload = {
            title: resumeId ? (currentData.personalInfo?.name + "'s Resume") : newResumeTitle,
            resume_data: finalData,
            is_public: isPublic
        };
        const headers = { 'Authorization': `Bearer ${authTokens?.access}` };

        try {
            let savedId = resumeId;
            if (resumeId) {
                await axios.put(`http://127.0.0.1:8000/api/resumes/${resumeId}/`, payload, { headers });
            } else {
                const res = await axios.post('http://127.0.0.1:8000/api/resumes/', payload, { headers });
                savedId = res.data.id;
                setResumeId(savedId);
                localStorage.setItem('currentResumeId', savedId);
            }
            
            message.success({ content: 'Saved successfully!', key: MSG_KEY, duration: 2 });
            
            if (shouldRedirect) {
                localStorage.removeItem('currentResumeId'); 
                setShowEditor(false); 
                setResumeId(null); 
                setResumeData(initialData); 
                form.resetFields();
                fetchResumesList(); 
            }

        } catch (error) {
            message.error({ content: 'Failed to save.', key: MSG_KEY });
        }
    };

    // --- UI HANDLERS ---
    const handleBackToDashboard = () => {
        setShowEditor(false);
        setResumeId(null);
        setResumeData(initialData);
        form.resetFields();
        localStorage.removeItem('currentResumeId');
        fetchResumesList(); 
    };

    const handleCreateNewClick = () => {
        setNewResumeTitle("My Resume");
        setTargetProfile('fresher');
        setIsCreateModalVisible(true);
    };

    const handleConfirmCreate = () => {
        setIsCreateModalVisible(false);
        setResumeId(null);
        localStorage.removeItem('currentResumeId');
        form.resetFields();
        setResumeData(JSON.parse(JSON.stringify(initialData)));
        setCurrentStep(0);
        setTargetProfile('fresher'); 
        setShowEditor(true); 
    };

    const handleEditClick = (id) => {
        localStorage.setItem('currentResumeId', id);
        fetchResumeAndRestore(id);
    };

    // --- MEMOIZED HANDLER (Crucial Fix) ---
    const handleFormChange = useCallback((changedValues, allValues) => { 
        setResumeData(allValues); 
    }, []);

    const handleToggleVisibility = () => { setIsPublic(!isPublic); message.info(`Resume is now ${!isPublic ? 'Public' : 'Private'}`); };
    
    // Replace the old handleDownload with this:
    const handleDownload = () => {
         // This triggers the browser's native print window.
         // Users just select "Save as PDF" as the destination.
         window.print();
    };

    const handleShare = async () => { 
        const element = resumeRef.current;
        if (!element) return;
        if (!navigator.canShare) return message.error("Browser doesn't support direct sharing");
        try {
            const canvas = await html2canvas(element, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            const blob = pdf.output('blob');
            const file = new File([blob], "resume.pdf", { type: 'application/pdf' });
            if (navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: 'My Resume' });
            }
        } catch(e) { console.error(e); }
    };

    const handleSelectTemplate = (id) => { setTemplateId(id); setTemplatePopoverVisible(false); };

    const templateSelectionContent = (
        <List dataSource={templateOptions} renderItem={item => (
            <List.Item onClick={() => handleSelectTemplate(item.id)} style={{ cursor: 'pointer', padding: '10px' }}>
                <List.Item.Meta title={item.name} description={item.description} />
                {templateId === item.id && <CheckOutlined style={{ color: '#3b82f6' }} />}
            </List.Item>
        )} style={{ width: 280 }} />
    );

    // --- RENDER ---
    return (
        <Layout className="builder-layout">
            <Header className="builder-header">
    <Space>
        {!showEditor ? (
            <Button 
                type="text" 
                icon={<HomeOutlined />} 
                onClick={() => navigate('/')} 
                style={{ fontSize: '16px', fontWeight: '600' }}
            >
                Back to Home
            </Button>
        ) : (
            <Button 
                type="text" 
                icon={<ArrowLeftOutlined />} 
                onClick={handleBackToDashboard}
                style={{ fontSize: '15px' }}
            >
                Dashboard
            </Button>
        )}
    </Space>

    {showEditor && (
        <Space size="small">
            {/* 1. TARGET PROFILE DROPDOWN (Dark Theme) */}
            <Select 
                value={targetProfile} 
                onChange={setTargetProfile} 
                style={{ width: 160 }} 
                className="header-select"
                options={profileOptions.map(p => ({ label: p.label, value: p.id }))} 
                placeholder="Target Profile"
                dropdownStyle={{ background: '#1e293b', border: '1px solid #334155' }}
            />

            {/* 2. CHANGE TEMPLATE (Ghost Button) */}
            <Popover content={templateSelectionContent} trigger="click" open={templatePopoverVisible} onOpenChange={setTemplatePopoverVisible}>
                <Button ghost>Change Template</Button>
            </Popover>
            
            {/* 3. VISIBILITY TOGGLE (Text Button) */}
            <Tooltip title={isPublic ? "Public" : "Private"}>
                <Button 
                    type="text"
                    icon={<EyeOutlined />} 
                    style={{ color: isPublic ? '#a5b4fc' : 'rgba(255,255,255,0.7)' }} 
                    onClick={handleToggleVisibility}
                > 
                    {isPublic ? 'Public' : 'Private'} 
                </Button>
            </Tooltip>

            {isPublic && ( 
                <Button type="text" icon={<ShareAltOutlined />} onClick={handleShare} /> 
            )}

            {/* 4. SAVE BUTTON (Ghost) */}
            <Button icon={<SaveOutlined />} onClick={() => handleSave(true)} ghost>
                Save Draft
            </Button>
            
            {/* 5. DOWNLOAD BUTTON (Updated) */}
<Button 
    type="primary" 
    icon={<DownloadOutlined />} 
    className="premium-download-btn" /* <--- ADD THIS CLASS */
    onClick={handleDownload}
>
    Download
</Button>
        </Space>
    )}
    
    {!showEditor && ( 
        <Button type="text" onClick={logoutUser} icon={<span style={{fontSize:'16px'}}>⏻</span>}>
            Logout
        </Button> 
    )}
</Header>

            <Content>
                {!showEditor ? (
                    /* === DASHBOARD VIEW === */
                    <>
                        <div className="dashboard-hero">
                            <h1>My Resumes</h1>
                            <p>Manage your drafts, create new versions, and get hired faster.</p>
                        </div>

                        <div className="dashboard-container">
                            {listLoading ? <Spin size="large" style={{ display: 'block', margin: '100px auto' }} /> : (
                                <div className="resume-grid">
                                    {/* Create New Card */}
                                    <div className="dashboard-card create-card" onClick={handleCreateNewClick}>
                                        <div className="create-icon-wrapper">
                                            <PlusOutlined />
                                        </div>
                                        <Text strong style={{ fontSize: '16px', color: '#1e293b' }}>Create New Resume</Text>
                                        <Text type="secondary">Start from scratch</Text>
                                    </div>

                                    {/* Existing Resumes */}
                                    {resumesList.map(resume => (
                                        <div key={resume.id} className="dashboard-card" onClick={() => handleEditClick(resume.id)}>
                                            <div className="resume-actions">
                                                <div className="action-icon" onClick={(e) => { e.stopPropagation(); handleEditClick(resume.id); }}>
                                                    <EditOutlined />
                                                </div>
                                                <div className="action-icon delete" onClick={(e) => { e.stopPropagation(); showDeleteConfirm(resume.id, resume.title); }}>
                                                    <DeleteOutlined />
                                                </div>
                                            </div>
                                            
                                            <div className="resume-card-icon">
                                                <FileTextOutlined />
                                            </div>
                                            
                                            <div style={{ width: '100%' }}>
                                                <div style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1f2937', marginBottom: '4px' }}>
                                                    {resume.title || "Untitled Resume"}
                                                </div>
                                                <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                                                    Updated {dayjs(resume.updated_at).format('MMM D, YYYY')}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* === EDITOR VIEW === */
<div className="editor-container">
    {/* LEFT SIDE: FORM */}
    <div className="editor-form-panel">
         <ResumeForm 
            formInstance={form} 
            onFormChange={handleFormChange} 
            authTokens={authTokens} 
            onSave={() => handleSave(false)} 
            currentStep={currentStep} 
            setCurrentStep={setCurrentStep} 
            stepTitles={stepTitles} 
        />
    </div>
    
    {/* RIGHT SIDE: DARK PREVIEW */}
    <div className="editor-preview-panel">
        {/* Wrapper Div to create the "Paper" effect */}
        <div className="resume-paper-shadow">
            <ResumePreview 
                ref={resumeRef} 
                resumeData={resumeData} 
                templateId={templateId} 
                targetProfile={targetProfile}
            />
        </div>
    </div>
</div>
                )}
            </Content>
            
            {/* Create Resume Modal */}
            <Modal 
                title="Create New Resume" 
                open={isCreateModalVisible} 
                onOk={handleConfirmCreate} 
                onCancel={() => setIsCreateModalVisible(false)}
                okText="Start Building"
                centered
            >
                <Form layout="vertical">
                    <Form.Item label="Resume Title" required>
                        <Input 
                            placeholder="e.g. Software Engineer Application" 
                            value={newResumeTitle} 
                            onChange={(e) => setNewResumeTitle(e.target.value)} 
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
};

const BuilderPage = () => ( <App> <BuilderPageContent /> </App> );
export default BuilderPage;