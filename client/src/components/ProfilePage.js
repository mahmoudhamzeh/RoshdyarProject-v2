import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
    const history = useHistory();
    const [user, setUser] = useState(null);
    const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
                if (!loggedInUser || !loggedInUser.id) {
                    history.push('/login');
                    return;
                }
                const response = await fetch(`http://localhost:5000/api/users/${loggedInUser.id}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch user data');
                }
                const userData = await response.json();
                setUser(userData);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchUser();
    }, [history]);

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPassword(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (password.new !== password.confirm) {
            setError('رمز عبور جدید و تکرار آن یکسان نیستند.');
            return;
        }
        try {
            const response = await fetch(`http://localhost:5000/api/users/${user.id}/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword: password.current, newPassword: password.new }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'خطا در تغییر رمز عبور');
            }
            setSuccess('رمز عبور با موفقیت تغییر کرد.');
            setPassword({ current: '', new: '', confirm: '' });
        } catch (err) {
            setError(err.message);
        }
    };

    if (error) return <div className="error-message">{error}</div>;
    if (!user) return <div>در حال بارگذاری...</div>;

    return (
        <div className="profile-page">
            <nav className="page-nav-final">
                <button onClick={() => history.push('/dashboard')} className="back-btn-add-child">&rarr;</button>
                <h1>پروفایل کاربری</h1>
                <div className="nav-placeholder"></div>
            </nav>
            <div className="profile-content">
                <div className="profile-info">
                    <h2>اطلاعات کاربر</h2>
                    <p><strong>نام کاربری:</strong> {user.username}</p>
                    <p><strong>ایمیل:</strong> {user.email}</p>
                </div>
                <div className="change-password">
                    <h2>تغییر رمز عبور</h2>
                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">{success}</p>}
                    <form onSubmit={handlePasswordSubmit}>
                        <div className="form-group">
                            <label>رمز عبور فعلی</label>
                            <input type="password" name="current" value={password.current} onChange={handlePasswordChange} required />
                        </div>
                        <div className="form-group">
                            <label>رمز عبور جدید</label>
                            <input type="password" name="new" value={password.new} onChange={handlePasswordChange} required />
                        </div>
                        <div className="form-group">
                            <label>تکرار رمز عبور جدید</label>
                            <input type="password" name="confirm" value={password.confirm} onChange={handlePasswordChange} required />
                        </div>
                        <button type="submit" className="btn-save">تغییر رمز</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
