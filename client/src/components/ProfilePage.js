import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import CitySelector from './CitySelector';
import './ProfilePage.css';

const ProfilePage = () => {
    const history = useHistory();
    const [user, setUser] = useState(null);
    const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const loggedInUserString = localStorage.getItem('loggedInUser');
                if (!loggedInUserString) {
                    history.push('/login');
                    return;
                }
                const loggedInUser = JSON.parse(loggedInUserString);
                if (!loggedInUser || !loggedInUser.id) {
                    setError("اطلاعات کاربری نامعتبر است.");
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

    const handleUserChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const handleUserSubmit = async () => {
        setError('');
        setSuccess('');
        try {
            const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'خطا در ذخیره اطلاعات');
            }
            setSuccess('اطلاعات با موفقیت ذخیره شد.');
            setIsEditing(false);
        } catch (err) {
            setError(err.message);
        }
    };

    if (error) return <div className="error-message">{`خطا: ${error}`}</div>;
    if (!user) return <div>در حال بارگذاری...</div>;

    const renderInfoRow = (label, value, name, type = 'text') => (
        <div className="info-row">
            <span className="info-label">{label}</span>
            {isEditing ? (
                <input
                    type={type}
                    name={name}
                    value={value || ''}
                    onChange={handleUserChange}
                    className="info-input"
                />
            ) : (
                <span className="info-value">{value}</span>
            )}
        </div>
    );

    return (
        <div className="profile-page">
            <nav className="page-nav-final">
                <button onClick={() => history.push('/dashboard')} className="back-btn-add-child">&rarr;</button>
                <h1>پروفایل کاربری</h1>
                <div className="nav-placeholder"></div>
            </nav>
            <div className="profile-content">
                <div className="profile-info card">
                    <div className="card-header">
                        <h2>اطلاعات کاربر</h2>
                        <button onClick={() => setIsEditing(!isEditing)} className="edit-btn">
                            {isEditing ? 'لغو' : 'ویرایش'}
                        </button>
                    </div>
                    {renderInfoRow('نام کاربری', user.username, 'username')}
                    {renderInfoRow('نام', user.firstName, 'firstName')}
                    {renderInfoRow('نام خانوادگی', user.lastName, 'lastName')}
                    {renderInfoRow('ایمیل', user.email, 'email', 'email')}
                    {renderInfoRow('شماره موبایل', user.mobile, 'mobile', 'tel')}
                    {renderInfoRow('تاریخ تولد', user.birthDate, 'birthDate', 'date')}
                    {isEditing ? (
                        <CitySelector
                            selectedProvince={user.province}
                            selectedCity={user.city}
                            onProvinceChange={handleUserChange}
                            onCityChange={handleUserChange}
                        />
                    ) : (
                        <>
                            {renderInfoRow('استان', user.province, 'province')}
                            {renderInfoRow('شهر', user.city, 'city')}
                        </>
                    )}
                    {isEditing && (
                        <button onClick={handleUserSubmit} className="btn-save">ذخیره اطلاعات</button>
                    )}
                </div>

                <div className="change-password card">
                    <div className="card-header">
                        <h2>تغییر رمز عبور</h2>
                    </div>
                    {success && <p className="success-message">{success}</p>}
                    {error && <p className="error-message">{error}</p>}
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
