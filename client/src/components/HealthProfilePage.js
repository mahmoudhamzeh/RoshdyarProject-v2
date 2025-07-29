import React, { useState, useEffect, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Modal from 'react-modal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import "react-datepicker/dist/react-datepicker.css";
import './HealthProfilePage.css';

Modal.setAppElement('#root');

const HealthProfilePage = () => {
    const routerHistory = useHistory();
    const { childId } = useParams();
    const [child, setChild] = useState(null);
    const [visits, setVisits] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);

    const fetchAllData = useCallback(async () => {
        try {
            const childRes = await fetch(`http://localhost:5000/api/children/${childId}`);
            const childData = await childRes.json();
            setChild(childData);

            const visitsRes = await fetch(`http://localhost:5000/api/visits/${childId}`);
            const visitsData = await visitsRes.json();
            setVisits(visitsData);

            const docsRes = await fetch(`http://localhost:5000/api/documents/${childId}`);
            const docsData = await docsRes.json();
            setDocuments(docsData);
        } catch (error) { routerHistory.push('/my-children'); }
    }, [childId, routerHistory]);

    useEffect(() => { fetchAllData(); }, [fetchAllData]);

    if (!child) return <p>در حال بارگذاری...</p>;
    const avatarUrl = child.avatar && child.avatar.startsWith('/uploads') ? `http://localhost:5000${child.avatar}` : (child.avatar || 'https://i.pravatar.cc/100');

    const calculateAge = (birthDate) => {
        if (!birthDate) return '';
        const today = new Date();
        const birthDateObj = new Date(birthDate);
        let age = today.getFullYear() - birthDateObj.getFullYear();
        const m = today.getMonth() - birthDateObj.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <div className="health-profile-page">
            <nav className="page-nav-final">
                <button onClick={() => routerHistory.push('/my-children')} className="back-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    <span>لیست کودکان</span>
                </button>
                <h1>پرونده سلامت</h1>
                <div className="nav-placeholder"></div>
            </nav>
            <header className="profile-header">
                <img src={avatarUrl} alt={child.name} className="profile-avatar" />
                <div className="profile-header-info">
                    <h2>{child.name}</h2>
                    <p>سن: {calculateAge(child.birthDate)}</p>
                </div>
            </header>
            <main className="profile-content-grid">
                <div className="grid-col-left">
                    <div className="main-info-card">
                        <h3>اطلاعات جامع سلامت</h3>
                        <div className="info-section">
                            <strong>اطلاعات پایه</strong>
                            <p>جنسیت: {child.gender === 'boy' ? 'پسر' : 'دختر'}</p>
                            <p>گروه خونی: {child.bloodType}</p>
                        </div>
                        <div className="info-section">
                            <strong>آلرژی‌ها</strong>
                            <div className="tags-container">
                                {child.allergies && child.allergies.types && Object.entries(child.allergies.types).filter(([_, v]) => v).map(([k]) => <span key={k} className="tag">{k}</span>)}
                            </div>
                            <p>{child.allergies && child.allergies.description}</p>
                        </div>
                        <div className="info-section">
                            <strong>بیماری‌های خاص</strong>
                            <div className="tags-container">
                                {child.special_illnesses && child.special_illnesses.types && Object.entries(child.special_illnesses.types).filter(([_, v]) => v).map(([k]) => <span key={k} className="tag">{k}</span>)}
                            </div>
                            <p>{child.special_illnesses && child.special_illnesses.description}</p>
                        </div>
                        <button onClick={() => routerHistory.push(`/health-analysis/${child.id}`)} className="edit-main-info-btn">مشاهده تحلیل پرونده</button>
                    </div>
                </div>
                <div className="grid-col-right">
                    <div className="action-card">
                        <h4>نمودار رشد</h4>
                        <div className="chart-preview">
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={(child.growthData && child.growthData.length > 0) ? child.growthData : [{date: 'شروع', height: 50, weight: 3}]}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="height" stroke="#8884d8" activeDot={{ r: 8 }} />
                                    <Line type="monotone" dataKey="weight" stroke="#82ca9d" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <button onClick={() => routerHistory.push(`/growth-chart/${childId}`)} className="view-full-chart-btn">نمایش کامل نمودار</button>
                    </div>
                    <div className="actions-grid">
                        <div className="action-card" onClick={() => setIsVisitModalOpen(true)}>
                            <h4>مراجعات پزشکی</h4>
                            <p>تعداد: {visits.length}</p>
                        </div>
                        <div className="action-card" onClick={() => setIsDocModalOpen(true)}>
                            <h4>مدارک پزشکی</h4>
                            <p>تعداد: {documents.length}</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modals will be updated later */}
            <Modal isOpen={isVisitModalOpen} onRequestClose={() => setIsVisitModalOpen(false)}>{/* ... Visit Modal ... */}</Modal>
            <Modal isOpen={isDocModalOpen} onRequestClose={() => setIsDocModalOpen(false)}>{/* ... Document Modal ... */}</Modal>
        </div>
    );
};

export default HealthProfilePage;