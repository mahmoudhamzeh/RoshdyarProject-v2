import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

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

            if (response.status === 200) {
                localStorage.setItem('loggedInUser', JSON.stringify(data.user));
                history.push('/dashboard');
            } else {
                setLoginMessage(data.message || 'اطلاعات ورود نادرست است.');
            }
        } catch (error) {
            setLoginMessage('خطا در ارتباط با سرور.');
        }
    };

    const handleSignup = async () => {
        if (!loginInput || !passwordInput) {
            setLoginMessage('لطفاً فیلدها را پر کنید.');
            return;
        }
        try {
            const response = await fetch('http://localhost:5000/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login: loginInput, password: passwordInput }),
            });
            const data = await response.json();
            if (response.ok) {
                setLoginMessage(data.message);
            } else {
                setLoginMessage(data.message || 'خطا در ثبت‌نام');
            }
        } catch (error) {
            setLoginMessage('خطا در ارتباط با سرور.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg text-center">
                <h2 className="text-2xl font-bold text-gray-900">ورود به حساب</h2>
                <input
                    type="text"
                    value={loginInput}
                    onChange={e => setLoginInput(e.target.value)}
                    placeholder="ایمیل یا شماره موبایل"
                    className="w-full px-4 py-2 text-gray-900 bg-gray-200 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="password"
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    placeholder="رمز عبور"
                    className="w-full px-4 py-2 text-gray-900 bg-gray-200 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleLogin}
                    className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                    ورود
                </button>
                <button
                    onClick={handleSignup}
                    className="w-full px-4 py-2 font-bold text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                >
                    ثبت‌نام
                </button>
                {loginMessage && <p className="text-red-500">{loginMessage}</p>}
            </div>
        </div>
    );
};

export default LoginPage;