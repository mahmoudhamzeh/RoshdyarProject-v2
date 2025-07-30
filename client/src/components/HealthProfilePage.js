import React, { useState, useEffect, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Modal from 'react-modal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import "react-datepicker/dist/react-datepicker.css";
import './HealthProfilePage.css';

Modal.setAppElement('#root');

const HealthProfilePage = () => {
    const history = useHistory();
    const { childId } = useParams();
    const [child, setChild] = useState(null);
    const [visits, setVisits] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAllData = useCallback(async () => {
        try {
            const childRes = await fetch(`http://localhost:5000/api/children/${childId}`);
            if (!childRes.ok) throw new Error('Child not found');
            const childData = await childRes.json();
            setChild(childData);

            const visitsRes = await fetch(`http://localhost:5000/api/visits/${childId}`);
            const visitsData = await visitsRes.json();
            setVisits(visitsData);

            const docsRes = await fetch(`http://localhost:5000/api/documents/${childId}`);
            const docsData = await docsRes.json();
            setDocuments(docsData);
        } catch (error) {
            history.push('/my-children');
        } finally {
            setIsLoading(false);
        }
    }, [childId, history]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const handleNavigateToGrowthChart = () => {
        history.push(`/growth-chart/${childId}`);
    };

    if (isLoading) {
        return <p>Loading...</p>;
    }

    if (!child) {
        return <p>Child not found.</p>;
    }

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
                <button onClick={() => history.push('/my-children')} className="back-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    <span>List of Children</span>
                </button>
                <h1>Health Record</h1>
                <div className="nav-placeholder"></div>
            </nav>
            <header className="profile-header">
                <img src={avatarUrl} alt={child.name} className="profile-avatar" />
                <div className="profile-header-info">
                    <h2>{child.name}</h2>
                    <p>Age: {calculateAge(child.birthDate)}</p>
                </div>
            </header>
            <main className="profile-content-grid">
                <div className="grid-col-left">
                    <div className="main-info-card">
                        <h3>Comprehensive Health Information</h3>
                        <div className="info-section">
                            <strong>Basic Information</strong>
                            <p>Gender: {child.gender === 'boy' ? 'Boy' : 'Girl'}</p>
                            <p>Blood Type: {child.bloodType}</p>
                        </div>
                        <div className="info-section">
                            <strong>Allergies</strong>
                            <div className="tags-container">
                                {child.allergies && child.allergies.types && Object.entries(child.allergies.types).filter(([_, v]) => v).map(([k]) => <span key={k} className="tag">{k}</span>)}
                            </div>
                            <p>{child.allergies && child.allergies.description}</p>
                        </div>
                        <div className="info-section">
                            <strong>Special Illnesses</strong>
                            <div className="tags-container">
                                {child.special_illnesses && child.special_illnesses.types && Object.entries(child.special_illnesses.types).filter(([_, v]) => v).map(([k]) => <span key={k} className="tag">{k}</span>)}
                            </div>
                            <p>{child.special_illnesses && child.special_illnesses.description}</p>
                        </div>
                        <button onClick={() => history.push(`/health-analysis/${child.id}`)} className="edit-main-info-btn">View Record Analysis</button>
                    </div>
                </div>
                <div className="grid-col-right">
                    <div className="action-card" onClick={handleNavigateToGrowthChart}>
                        <h4>Growth Chart</h4>
                        <div className="chart-preview">
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={(child.growthData && child.growthData.length > 0) ? child.growthData : [{date: 'Start', height: 50, weight: 3}]}>
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
                        <p className="view-full-chart-text">View Full Chart</p>
                    </div>
                    <div className="actions-grid">
                        <div className="action-card" onClick={() => setIsVisitModalOpen(true)}>
                            <h4>Medical Visits</h4>
                            <p>Number: {visits.length}</p>
                        </div>
                        <div className="action-card" onClick={() => setIsDocModalOpen(true)}>
                            <h4>Medical Documents</h4>
                            <p>Number: {documents.length}</p>
                        </div>
                    </div>
                </div>
            </main>

            <Modal isOpen={isVisitModalOpen} onRequestClose={() => setIsVisitModalOpen(false)}>
                <h2>Medical Visits</h2>
            </Modal>
            <Modal isOpen={isDocModalOpen} onRequestClose={() => setIsDocModalOpen(false)}>
                <h2>Medical Documents</h2>
            </Modal>
        </div>
    );
};

export default HealthProfilePage;
