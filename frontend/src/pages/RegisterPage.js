// frontend/src/pages/RegisterPage.js
import React, { useContext } from 'react';
import { Form, Input, Button } from 'antd'; // Removed Card, Typography, Row, Col as we use custom CSS layout now
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './RegisterPage.css'; // Import the new styles

const RegisterPage = () => {
    const { registerUser } = useContext(AuthContext);

    const onFinish = (values) => {
        // Your original logic preserved
        if (values.password !== values.password2) {
            alert("Passwords do not match!");
            return;
        }
        registerUser(values.username, values.email, values.password);
    };

    return (
        <div className="register-container">
            <div className="register-card">
                
                <h1 className="register-title">Create Account</h1>
                <p className="register-subtitle">Join us to build your professional resume</p>

                <Form 
                    name="register" 
                    onFinish={onFinish}
                    layout="vertical"
                    scrollToFirstError
                >
                    {/* Username Field */}
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Please input your Username!' }]}
                    >
                        <Input 
                            prefix={<UserOutlined style={{ color: '#9ca3af' }} />} 
                            placeholder="Username" 
                            className="register-input"
                        />
                    </Form.Item>

                    {/* Email Field */}
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Please input your Email!' }, 
                            { type: 'email', message: 'Not a valid email!' }
                        ]}
                    >
                        <Input 
                            prefix={<MailOutlined style={{ color: '#9ca3af' }} />} 
                            placeholder="Email" 
                            className="register-input"
                        />
                    </Form.Item>

                    {/* Password Field */}
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your Password!' }]}
                    >
                        <Input.Password 
                            prefix={<LockOutlined style={{ color: '#9ca3af' }} />} 
                            placeholder="Password" 
                            className="register-input"
                        />
                    </Form.Item>

                    {/* Confirm Password Field */}
                    <Form.Item
                        name="password2"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Please confirm your Password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The two passwords do not match!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password 
                            prefix={<LockOutlined style={{ color: '#9ca3af' }} />} 
                            placeholder="Confirm Password" 
                            className="register-input"
                        />
                    </Form.Item>

                    {/* Submit Button */}
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block className="register-btn">
                            Register
                        </Button>
                    </Form.Item>

                    {/* Footer */}
                    <div className="register-footer">
                        Already have an account? <Link to="/login">Login here!</Link>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default RegisterPage;