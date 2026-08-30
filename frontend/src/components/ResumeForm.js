import React, { useState } from 'react';
import { Form, Input, Button, Row, Col, Typography, Space, Checkbox, Spin, DatePicker, Empty, Tag } from 'antd';
import {
    PlusOutlined, DeleteOutlined, ThunderboltOutlined, LeftOutlined, RightOutlined, CloseOutlined,
    UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, SolutionOutlined,
    LinkedinOutlined, GithubOutlined, ReadOutlined, ExperimentOutlined, SafetyCertificateOutlined, StarOutlined
} from '@ant-design/icons';
import './ResumeForm_Custom.css';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const ResumeForm = ({
    formInstance,
    onFormChange,
    initialData,
    authTokens,
    currentStep,
    setCurrentStep,
    stepTitles,
    onSave
}) => {
    // Local loading state for the save button
    const [isSaving, setIsSaving] = useState(false);

    const handleInternalSave = async () => {
        setIsSaving(true);
        try {
            await onSave(); 
        } finally {
            setIsSaving(false);
        }
    }; 

    const [aiLoadingIndex, setAiLoadingIndex] = useState(null);
    const [aiLoadingSummary, setAiLoadingSummary] = useState(false);
    const [aiLoadingProjectIndex, setAiLoadingProjectIndex] = useState(null);
    const [currentSkill, setCurrentSkill] = useState('');

    const onNext = () => {
        if (stepTitles && currentStep < stepTitles.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const onPrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const disabledDate = (current) => {
        return current && current > dayjs().endOf('month');
    };

    // --- AI HANDLERS ---
    const handleEnhanceExperienceAI = async (index) => {
        const description = formInstance.getFieldValue(['experience', index, 'description']);
        if (!description) return alert("Please write a description to enhance.");
        setAiLoadingIndex(index);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/enhance/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + String(authTokens.access) },
                body: JSON.stringify({ text: description })
            });
            if (!response.ok) throw new Error('AI enhancement failed');
            const data = await response.json();
            formInstance.setFieldsValue({ experience: { [index]: { description: data.enhanced_text } } });
            onFormChange(null, formInstance.getFieldsValue());
        } catch (error) {
            console.error(error);
        } finally {
            setAiLoadingIndex(null);
        }
    };
    
    const handleEnhanceSummaryAI = async () => {
        const summaryText = formInstance.getFieldValue('summary');
        if (!summaryText) return alert("Please write a summary to enhance.");
        setAiLoadingSummary(true);
        try {
            const prompt = `Rewrite the following professional summary...`;
            const response = await fetch('http://127.0.0.1:8000/api/enhance/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + String(authTokens.access) },
                body: JSON.stringify({ text: summaryText, prompt_override: prompt })
            });
            if (!response.ok) throw new Error('AI summary enhancement failed');
            const data = await response.json();
            formInstance.setFieldsValue({ summary: data.enhanced_text });
            onFormChange(null, formInstance.getFieldsValue());
        } catch (error) {
            console.error(error);
        } finally {
            setAiLoadingSummary(false);
        }
    };

    const handleEnhanceProjectAI = async (index) => {
        const currentProjects = formInstance.getFieldValue('projects') || [];
        const description = currentProjects[index]?.description;
        if (!description) return alert("Please write a project description to enhance.");
        setAiLoadingProjectIndex(index);
        try {
            const prompt = `Rewrite the following project description into 2-3 concise, impactful bullet points using strong action verbs. Use '• ' as the bullet character.\nInput: '${description}'`;
            const response = await fetch('http://127.0.0.1:8000/api/enhance/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + String(authTokens.access) },
                body: JSON.stringify({ text: description, prompt_override: prompt })
            });
            if (!response.ok) throw new Error('AI project enhancement failed');
            const data = await response.json();
            const updatedProjects = [...currentProjects];
            updatedProjects[index] = { ...updatedProjects[index], description: data.enhanced_text };
            formInstance.setFieldsValue({ projects: updatedProjects });
            onFormChange(null, formInstance.getFieldsValue());
        } catch (error) {
            console.error("AI Error:", error);
        } finally {
            setAiLoadingProjectIndex(null);
        }
    };

    const renderStepTitle = () => {
        if (!stepTitles || stepTitles.length === 0 || currentStep >= stepTitles.length) {
            return <Title level={4} style={{ marginBottom: '16px' }}>Loading...</Title>;
        }
        const title = stepTitles[currentStep];
        let button = null;
        if (title === 'Professional Summary') {
            button = (<Button className="ai-button" icon={<ThunderboltOutlined />} onClick={handleEnhanceSummaryAI} loading={aiLoadingSummary} > AI Enhance </Button>);
        }
        return (
            <Space style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <Title level={3} style={{ margin: 0, color: '#1e293b' }}>{title}</Title>
                    <div style={{ height: '4px', width: '40px', background: '#4f46e5', marginTop: '4px', borderRadius: '2px' }}></div>
                </div>
                {button}
            </Space>
        );
    };

    return (
        <div style={{ background: '#fff', padding: '32px', borderRadius: '12px' }}>
            <Form form={formInstance} layout="vertical" initialValues={initialData} onValuesChange={onFormChange} >

                <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
                    <Button className="step-nav-button" icon={<LeftOutlined />} onClick={onPrev} disabled={currentStep === 0} > Previous </Button>
                    <Button className="step-nav-button" onClick={onNext} disabled={!stepTitles || currentStep === stepTitles.length - 1} > <Space> Next <RightOutlined /> </Space> </Button>
                </Space>

                {renderStepTitle()}

                {/* --- Step 0: Personal Info --- */}
                <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
                    <Paragraph type="secondary" style={{ marginBottom: '24px' }}> Get started with your personal details. </Paragraph>

                    <Row gutter={24}>
                        <Col span={24}>
                             <Form.Item label="Full Name" name={['personalInfo', 'name']} rules={[{ required: true, message: 'Please enter your full name!' }]} >
                                <Input prefix={<UserOutlined style={{ color: '#cbd5e1' }} />} placeholder="e.g. John Doe" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Email Address" name={['personalInfo', 'email']} rules={[{ required: true }, { type: 'email' }]} >
                                <Input prefix={<MailOutlined style={{ color: '#cbd5e1' }} />} placeholder="name@example.com" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="Phone Number" name={['personalInfo', 'phone']} >
                                <Input prefix={<PhoneOutlined style={{ color: '#cbd5e1' }} />} placeholder="+1 234 567 890" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                             <Form.Item label="Location" name={['personalInfo', 'location']} >
                                <Input prefix={<EnvironmentOutlined style={{ color: '#cbd5e1' }} />} placeholder="City, Country" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                             <Form.Item label="Profession" name={['personalInfo', 'profession']} >
                                <Input prefix={<SolutionOutlined style={{ color: '#cbd5e1' }} />} placeholder="e.g. Software Engineer" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                             <Form.Item label="LinkedIn" name={['personalInfo', 'linkedin']} >
                                <Input prefix={<LinkedinOutlined style={{ color: '#cbd5e1' }} />} placeholder="LinkedIn URL" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                             <Form.Item label="GitHub" name={['personalInfo', 'website']} >
                                <Input prefix={<GithubOutlined style={{ color: '#cbd5e1' }} />} placeholder="GitHub URL" />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                {/* --- Step 1: Summary --- */}
                <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
                    <Paragraph type="secondary" style={{ marginBottom: '20px' }}> Write a short professional summary to highlight your top skills. </Paragraph>
                    <Spin spinning={aiLoadingSummary} tip="Writing for you...">
                        <Form.Item name="summary">
                            <TextArea rows={6} placeholder="e.g. Passionate software engineer with 3+ years of experience in..." style={{ resize: 'none' }} />
                        </Form.Item>
                    </Spin>
                </div>

                {/* --- Step 2: Experience --- */}
                <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
                    <Form.List name="experience">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.length === 0 && (<Empty description="No experience added yet." style={{ margin: '40px 0' }} />)}
                                {fields.map(({ key, name, ...restField }, index) => (
                                    <div key={key} className="custom-form-card">
                                        <Spin spinning={aiLoadingIndex === index} tip="Enhancing...">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                                 <Title level={5} style={{ margin: 0, color: '#4f46e5' }}>{`Role #${index + 1}`}</Title>
                                                 <DeleteOutlined className="delete-button" onClick={() => remove(name)} />
                                            </div>
                                            
                                            <Row gutter={16}>
                                                <Col span={12}><Form.Item {...restField} label="Company" name={[name, 'company']}><Input placeholder="Company Name" /></Form.Item></Col>
                                                <Col span={12}><Form.Item {...restField} label="Job Title" name={[name, 'title']}><Input placeholder="Job Title" /></Form.Item></Col>
                                                <Col span={12}><Form.Item {...restField} label="Location" name={[name, 'location']}><Input placeholder="City, Country" /></Form.Item></Col>
                                                <Col span={12}><Form.Item {...restField} label="Start Date" name={[name, 'startDate']}><DatePicker picker="month" format="MMMM, YYYY" style={{ width: '100%' }} disabledDate={disabledDate} /></Form.Item></Col>
                                                
                                                <Col span={12}>
                                                    <Form.Item noStyle shouldUpdate={(pv, cv) => pv.experience?.[index]?.currentlyWorking !== cv.experience?.[index]?.currentlyWorking}>
                                                        {({ getFieldValue }) => !getFieldValue(['experience', index, 'currentlyWorking']) ?
                                                            (<Form.Item {...restField} label="End Date" name={[name, 'endDate']}><DatePicker picker="month" format="MMMM, YYYY" style={{ width: '100%' }} disabledDate={disabledDate} /></Form.Item>) :
                                                            (<Form.Item label="End Date"><Input disabled placeholder="Present" /></Form.Item>)
                                                        }
                                                    </Form.Item>
                                                </Col>
                                                
                                                <Col span={24}><Form.Item {...restField} name={[name, 'currentlyWorking']} valuePropName="checked"><Checkbox>I currently work here</Checkbox></Form.Item></Col>
                                                
                                                <Col span={24}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                        <span style={{ fontWeight: 500 }}>Description</span>
                                                        <Button className="ai-button" icon={<ThunderboltOutlined />} onClick={() => handleEnhanceExperienceAI(index)}> Enhance </Button>
                                                    </div>
                                                    <Form.Item {...restField} name={[name, 'description']}>
                                                        <TextArea rows={4} placeholder="• Achieved X by doing Y..." />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Spin>
                                    </div>
                                ))}
                                <Button type="dashed" className="add-button" onClick={() => add({ currentlyWorking: false }, 0)} block icon={<PlusOutlined />} > Add Experience </Button>
                            </>
                        )}
                    </Form.List>
                </div>

                {/* --- Step 3: Education --- */}
                <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
                    <Form.List name="education">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.length === 0 && (<Empty image={<ReadOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />} description="No education added yet." style={{ margin: '40px 0' }} />)}
                                {fields.map(({ key, name, ...restField }, index) => (
                                    <div key={key} className="custom-form-card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                             <Title level={5} style={{ margin: 0, color: '#4f46e5' }}>{`Education #${index + 1}`}</Title>
                                             <DeleteOutlined className="delete-button" onClick={() => remove(name)} />
                                        </div>
                                        <Row gutter={16}>
                                            <Col span={12}><Form.Item {...restField} label="Institution" name={[name, 'institutionName']}><Input placeholder="University Name" /></Form.Item></Col>
                                            <Col span={12}><Form.Item {...restField} label="Degree" name={[name, 'degree']}><Input placeholder="e.g. Bachelor's" /></Form.Item></Col>
                                            <Col span={12}><Form.Item {...restField} label="Field of Study" name={[name, 'fieldOfStudy']}><Input placeholder="e.g. Computer Science" /></Form.Item></Col>
                                            <Col span={12}><Form.Item {...restField} label="Graduation Date" name={[name, 'date']}><DatePicker picker="month" format="MMMM, YYYY" style={{ width: '100%' }} disabledDate={disabledDate} /></Form.Item></Col>
                                            <Col span={12}><Form.Item {...restField} label="GPA" name={[name, 'gpa']}><Input placeholder="e.g. 3.8/4.0" /></Form.Item></Col>
                                        </Row>
                                    </div>
                                ))}
                                <Button type="dashed" className="add-button" onClick={() => add({ institutionName: '', degree: '', fieldOfStudy: '', date: null, gpa: '' }, 0)} block icon={<PlusOutlined />} > Add Education </Button>
                            </>
                        )}
                    </Form.List>
                </div>

                {/* --- Step 4: Projects --- */}
                <div style={{ display: currentStep === 4 ? 'block' : 'none' }}>
                    <Form.List name="projects">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.length === 0 && (<Empty image={<ExperimentOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />} description="No projects added yet." style={{ margin: '40px 0' }} />)}
                                {fields.map(({ key, name, ...restField }, index) => (
                                    <div key={key} className="custom-form-card">
                                        <Spin spinning={aiLoadingProjectIndex === index} tip="Enhancing...">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                                 <Title level={5} style={{ margin: 0, color: '#4f46e5' }}>{`Project #${index + 1}`}</Title>
                                                 <DeleteOutlined className="delete-button" onClick={() => remove(name)} />
                                            </div>
                                            <Row gutter={16}>
                                                <Col span={12}><Form.Item {...restField} label="Project Name" name={[name, 'name']}><Input placeholder="Project Name" /></Form.Item></Col>
                                                <Col span={12}><Form.Item {...restField} label="Tech Stack" name={[name, 'type']}><Input placeholder="e.g. React, Node.js" /></Form.Item></Col>
                                                <Col span={12}><Form.Item {...restField} label="Start Date" name={[name, 'startDate']}><DatePicker picker="month" format="MMMM, YYYY" style={{ width: '100%' }} disabledDate={disabledDate} /></Form.Item></Col>
                                                <Col span={12}>
                                                    <Form.Item noStyle shouldUpdate={(pv, cv) => pv.projects?.[index]?.currentlyWorking !== cv.projects?.[index]?.currentlyWorking}>
                                                        {({ getFieldValue }) => !getFieldValue(['projects', index, 'currentlyWorking']) ?
                                                            (<Form.Item {...restField} label="End Date" name={[name, 'endDate']}><DatePicker picker="month" format="MMMM, YYYY" style={{ width: '100%' }} disabledDate={disabledDate} /></Form.Item>) :
                                                            (<Form.Item label="End Date"><Input disabled placeholder="Ongoing" /></Form.Item>)
                                                        }
                                                    </Form.Item>
                                                </Col>
                                                <Col span={24}><Form.Item {...restField} name={[name, 'currentlyWorking']} valuePropName="checked"><Checkbox>Ongoing Project</Checkbox></Form.Item></Col>
                                                <Col span={24}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                        <span style={{ fontWeight: 500 }}>Description</span>
                                                        <Button className="ai-button" icon={<ThunderboltOutlined />} onClick={() => handleEnhanceProjectAI(index)}> Enhance </Button>
                                                    </div>
                                                    <Form.Item {...restField} name={[name, 'description']}>
                                                        <TextArea rows={4} placeholder="Describe features and impact..." />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Spin>
                                    </div>
                                ))}
                                <Button type="dashed" className="add-button" onClick={() => add({ name: '', type: '', startDate: null, endDate: null, currentlyWorking: false, description: '' }, 0)} block icon={<PlusOutlined />} > Add Project </Button>
                            </>
                        )}
                    </Form.List>
                </div>

                {/* --- Step 5: Skills --- */}
                <div style={{ display: currentStep === 5 ? 'block' : 'none' }}>
                    <Form.List name="skills">
                        {(fields, { add, remove }) => {
                            const handleAddSkillLocal = () => { 
                                if (currentSkill && currentSkill.trim() !== '') {
                                    const existingSkills = formInstance.getFieldValue('skills') || [];
                                    const isDuplicate = existingSkills.some(skill => skill.name.toLowerCase() === currentSkill.trim().toLowerCase());
                                    if (!isDuplicate) {
                                        add({ name: currentSkill.trim() });
                                        setCurrentSkill('');
                                    }
                                }
                            };
                            return (
                                <>
                                    <Space style={{ display: 'flex', width: '100%', marginBottom: '16px' }}>
                                        <Input placeholder="Enter a skill (e.g. JavaScript)" value={currentSkill} onChange={(e) => setCurrentSkill(e.target.value)} onPressEnter={(e) => { e.preventDefault(); handleAddSkillLocal(); }} />
                                        <Button type="primary" onClick={handleAddSkillLocal}> Add </Button>
                                    </Space>

                                    <div className="skills-tag-container">
                                        {fields.length === 0 && <div className="skills-empty-state">No skills added yet.</div>}
                                        <Space wrap size={[8, 8]}>
                                            {fields.map((field, index) => {
                                                const skillName = formInstance.getFieldValue(['skills', index, 'name']);
                                                return skillName ? (
                                                    <Tag key={field.key} closable onClose={() => remove(index)} className="skill-tag" closeIcon={<CloseOutlined />}>
                                                        <Form.Item {...field} name={[field.name, 'name']} noStyle />
                                                        {skillName}
                                                    </Tag>
                                                ) : null;
                                            })}
                                        </Space>
                                    </div>
                                </>
                            );
                        }}
                    </Form.List>
                </div>

                {/* --- Step 6: Certificates --- */}
                <div style={{ display: currentStep === 6 ? 'block' : 'none' }}>
                    <Form.List name="certificates">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.length === 0 && (<Empty image={<SafetyCertificateOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />} description="No certificates added yet." style={{ margin: '40px 0' }} />)}
                                {fields.map(({ key, name, ...restField }, index) => (
                                    <div key={key} className="custom-form-card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                             <Title level={5} style={{ margin: 0, color: '#4f46e5' }}>{`Certificate #${index + 1}`}</Title>
                                             <DeleteOutlined className="delete-button" onClick={() => remove(name)} />
                                        </div>
                                        <Row gutter={16}>
                                            <Col span={12}><Form.Item {...restField} label="Name" name={[name, 'name']}><Input placeholder="Certificate Name" /></Form.Item></Col>
                                            <Col span={12}><Form.Item {...restField} label="Issuer" name={[name, 'issuer']}><Input placeholder="Issuing Org" /></Form.Item></Col>
                                            <Col span={12}><Form.Item {...restField} label="Date" name={[name, 'date']}><DatePicker picker="month" format="MMMM, YYYY" style={{ width: '100%' }} disabledDate={disabledDate} /></Form.Item></Col>
                                        </Row>
                                    </div>
                                ))}
                                <Button type="dashed" className="add-button" onClick={() => add({ name: '', issuer: '', date: null }, 0)} block icon={<PlusOutlined />} > Add Certificate </Button>
                            </>
                        )}
                    </Form.List>
                </div>

                <Button 
                    type="primary" 
                    size="large" 
                    block 
                    onClick={handleInternalSave}
                    loading={isSaving} 
                    className="save-changes-btn" 
                >
                    Save Changes
                </Button>
            </Form>
        </div>
    );
};

export default ResumeForm;