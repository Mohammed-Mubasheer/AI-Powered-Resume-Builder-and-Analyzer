// frontend/src/pages/LoginPage.js
import React, { useContext } from 'react';
import { Form, Input, Button } from 'antd'; // Removed Card, Typography, Row, Col as we use CSS now
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './LoginPage.css'; // Import the new CSS file

const LoginPage = () => {
    const { loginUser } = useContext(AuthContext);

    const onFinish = (values) => {
        // PRESERVED YOUR LOGIC:
        loginUser(values.username, values.password);
    };

    return (
        <div className="login-container">
            <div className="login-card">
                
                {/* Replaced <Title> with styled h1 */}
                <h1 className="login-title">Welcome Back</h1>
                <p className="login-subtitle">Enter your credentials to access your account</p>

                <Form 
                    name="login" 
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Please input your Username!' }]}
                    >
                        <Input 
                            prefix={<UserOutlined style={{ color: '#9ca3af' }} />} 
                            placeholder="Username" 
                            className="login-input"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your Password!' }]}
                    >
                        <Input.Password 
                            prefix={<LockOutlined style={{ color: '#9ca3af' }} />} 
                            placeholder="Password" 
                            className="login-input"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block className="login-btn">
                            Log in
                        </Button>
                    </Form.Item>

                    <div className="login-footer">
                        Or <Link to="/register">register now!</Link>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default LoginPage;