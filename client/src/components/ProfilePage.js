import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import UserInfo from './UserInfo';
import ChangePassword from './ChangePassword';
import Placeholder from './Placeholder';
import './ProfilePage.css';

const ProfilePage = () => {
    const history = useHistory();
    const [activeTab, setActiveTab] = useState('userInfo');

    const renderContent = () => {
        switch (activeTab) {
            case 'userInfo':
                return <UserInfo />;
            case 'changePassword':
                return <ChangePassword />;
            case 'appointments':
                return <Placeholder title="نوبت‌های من" />;
            case 'consultations':
                return <Placeholder title="مشاوره‌های متنی" />;
            case 'support':
                return <Placeholder title="پشتیبانی" />;
            default:
                return <UserInfo />;
        }
    };

    return (
        <div className="profile-page">
            <nav className="page-nav-final">
                <button onClick={() => history.push('/dashboard')} className="back-btn">
                    &rarr; <span>صفحه اصلی</span>
                </button>
                <h1>پروفایل کاربری</h1>
                <div className="nav-placeholder"></div>
            </nav>
            <div className="profile-layout">
                <aside className="profile-sidebar">
                    <button onClick={() => setActiveTab('userInfo')} className={activeTab === 'userInfo' ? 'active' : ''}>اطلاعات کاربری</button>
                    <button onClick={() => setActiveTab('appointments')} className={activeTab === 'appointments' ? 'active' : ''}>نوبت های من</button>
                    <button onClick={() => setActiveTab('consultations')} className={activeTab === 'consultations' ? 'active' : ''}>مشاوره های متنی</button>
                    <button onClick={() => setActiveTab('support')} className={activeTab === 'support' ? 'active' : ''}>پشتبانی</button>
                    <button onClick={() => setActiveTab('changePassword')} className={activeTab === 'changePassword' ? 'active' : ''}>تغییر رمز</button>
                </aside>
                <main className="profile-content">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;
