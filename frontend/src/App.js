import React from 'react';
import { Routes, Route } from 'react-router-dom';
import 'antd/dist/reset.css';
import { Layout } from 'antd';
import { AuthProvider } from './context/AuthContext';

import HomePage from './pages/HomePage';
import BuilderPage from './pages/BuilderPage'; // This now handles List AND Editor
import AnalyzerPage from './pages/AnalyzerPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
// import 'resume-project/frontend/src/Analyzer/templates/index.html'; // Import Analyzer styles

const { Content } = Layout;

function App() {
  return (
    <AuthProvider>
      <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
        <Content>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* --- PROTECTED ROUTES --- */}
            {/* 1. Selection Screen */}
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            
            {/* 2. Merged Builder (Handles Dashboard List + Editor) */}
            <Route path="/builder" element={<ProtectedRoute><BuilderPage /></ProtectedRoute>} />
            
            {/* 3. Analyzer */}
            <Route path="/analyzer" element={<ProtectedRoute><AnalyzerPage /></ProtectedRoute>} />
          </Routes>
        </Content>
      </Layout>
    </AuthProvider>
  );
}

export default App;