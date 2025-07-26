import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
    const history = useHistory();
    const [loginInput, setLoginInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [loginMessage, setLoginMessage] = useState('');

    const handleLogin = async () => {
        if (!loginInput || !passwordInput) {
            setLoginMessage('لطفاً فیلدها را پر کنید.');
            return;
        }
        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login: loginInput, password: passwordInput }),
            });

            const data = await response.json();

            // **تغییر اصلی اینجاست**
            if (response.status === 200) {
                localStorage.setItem('loggedInUser', data.user);
                history.push('/dashboard');
            } else {
                setLoginMessage(data.message || 'اطلاعات ورود نادرست است.');
            }
        } catch (error) {
            setLoginMessage('خطا در ارتباط با سرور.');
        }
    };

    const handleSignup = async () => {
        // ... (کد ثبت‌نام بدون تغییر باقی می‌ماند)
        if (!loginInput || !passwordInput) {
            setLoginMessage('لطفاً فیلدها را پر کنید.');
            return;
        }
        const response = await fetch('http://localhost:5000/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login: loginInput, password: passwordInput }),
        });
        const data = await response.json();
        setLoginMessage(data.message);
    };

    // The rest of the component remains the same...
    return (
        <div className="login-container">
            <h2>ورود به حساب</h2>
            <input type="text" value={loginInput} onChange={e => setLoginInput(e.target.value)} placeholder="ایمیل یا شماره موبایل" />
            <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="رمز عبور" />
            <button onClick={handleLogin}>ورود</button>
            <button onClick={handleSignup} style={{backgroundColor: '#4CAF50', marginTop: '10px'}}>ثبت‌نام</button>
            {loginMessage && <p style={{color: 'red'}}>{loginMessage}</p>}
        </div>
    );
};

export default LoginPage;