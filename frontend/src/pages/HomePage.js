// frontend/src/pages/HomePage.js
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Button } from 'antd';
import { EditOutlined, ExperimentOutlined, LogoutOutlined } from '@ant-design/icons';
import AuthContext from '../context/AuthContext';
import './HomePage_Custom.css'; // This now loads the premium gradient styles

const { Header, Content } = Layout;

const HomePage = () => {
    const { user, logoutUser } = useContext(AuthContext);
    const navigate = useNavigate();

    return (
        <Layout className="home-container">
            {/* Transparent Header overlay */}
            <Header style={{ 
                background: 'transparent', 
                padding: '0 40px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                position: 'absolute',
                width: '100%',
                zIndex: 10
            }}>
                <div style={{ color: 'white', fontSize: '1.2rem', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    AI Resume Project
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ color: 'white', opacity: 0.9, fontWeight: 500 }}>Hi, {user?.username || 'User'}!</span>
                    <Button 
                        type="default" 
                        shape="round" 
                        icon={<LogoutOutlined />} 
                        onClick={logoutUser}
                        ghost
                        style={{ color: 'white', borderColor: 'rgba(255,255,255,0.6)', fontWeight: 500 }}
                    >
                        Logout
                    </Button>
                </div>
            </Header>

            <Content>
                {/* 1. Hero Section */}
                <div className="home-hero">
                    <h1>What would you like to create today?</h1>
                    <p>Build a professional resume or analyze your existing one to increase your hiring chances.</p>
                </div>

                {/* 2. Action Cards */}
                <div className="home-content">
                    
                    {/* Resume Builder Card */}
                    <div className="action-card builder-card">
                        <div className="icon-wrapper">
                            <EditOutlined />
                        </div>
                        <div className="card-title">Resume Builder</div>
                        <p className="card-desc">
                            Create a stunning, ATS-friendly resume from scratch using our professional templates.
                        </p>
                        <button 
                            className="action-btn btn-primary" 
                            onClick={() => navigate('/builder')}
                        >
                            Create Resume
                        </button>
                    </div>

                    {/* Resume Analyzer Card */}
                    <div className="action-card analyzer-card">
                        <div className="icon-wrapper">
                            <ExperimentOutlined />
                        </div>
                        <div className="card-title">Resume Analyzer</div>
                        <p className="card-desc">
                            Get an AI-powered score and keyword suggestions to improve your existing resume.
                        </p>
                        <button 
                            className="action-btn btn-outline"
                            onClick={() => navigate('/analyzer')}
                        >
                            Analyze Now
                        </button>
                    </div>

                </div>
            </Content>
        </Layout>
    );
};

export default HomePage;