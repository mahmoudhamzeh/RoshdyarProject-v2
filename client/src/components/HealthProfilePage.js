import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Modal from 'react-modal';
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

    useEffect(() => {
        const abortController = new AbortController();
        const { signal } = abortController;

        const fetchAllData = async () => {
            try {
                const [childRes, visitsRes, docsRes] = await Promise.all([
                    fetch(`http://localhost:5000/api/children/${childId}`, { signal }),
                    fetch(`http://localhost:5000/api/visits/${childId}`, { signal }),
                    fetch(`http://localhost:5000/api/documents/${childId}`, { signal })
                ]);

                if (!childRes.ok) throw new Error('Child not found');

                const childData = await childRes.json();
                const visitsData = await visitsRes.json();
                const docsData = await docsRes.json();

                setChild(childData);
                setVisits(visitsData);
                setDocuments(docsData);

            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('Fetch aborted');
                } else {
                    history.push('/my-children');
                }
            } finally {
                if (!signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        fetchAllData();

        return () => {
            abortController.abort();
        };
    }, [childId, history]);

    const handleNavigateToGrowthChart = () => {
        history.push(`/growth-chart/${childId}`);
    };

    if (isLoading) {
        return <p>در حال بارگذاری...</p>;
    }

    if (!child) {
        return <p>کودک یافت نشد.</p>;
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
                    <span>لیست کودکان</span>
                </button>
                <h1>پرونده سلامت</h1>
            </nav>
            <header className="profile-header">
                <img src={avatarUrl} alt={child.name} className="profile-avatar" />
                <div className="profile-header-info">
                    <h2>{child.name}</h2>
                    <p>سن: {calculateAge(child.birthDate)}</p>
                </div>
            </header>
            <main className="profile-content-container">
                <div className="main-info-card-large">
                    <h3>اطلاعات جامع سلامت</h3>
                    <div className="info-grid">
                        <div className="info-item"><strong>جنسیت:</strong> {child.gender === 'boy' ? 'پسر' : 'دختر'}</div>
                        <div className="info-item"><strong>گروه خونی:</strong> {child.bloodType}</div>
                    </div>
                    <div className="info-section">
                        <strong>آلرژی‌ها:</strong>
                        <div className="tags-container">
                            {child.allergies && child.allergies.types && Object.entries(child.allergies.types).filter(([_, v]) => v).map(([k]) => <span key={k} className="tag allergy">{k}</span>)}
                        </div>
                        {child.allergies && child.allergies.description && <p className="description-text">{child.allergies.description}</p>}
                    </div>
                    <div className="info-section">
                        <strong>بیماری‌های خاص:</strong>
                        <div className="tags-container">
                            {child.special_illnesses && child.special_illnesses.types && Object.entries(child.special_illnesses.types).filter(([_, v]) => v).map(([k]) => <span key={k} className="tag illness">{k}</span>)}
                        </div>
                        {child.special_illnesses && child.special_illnesses.description && <p className="description-text">{child.special_illnesses.description}</p>}
                    </div>
                    <button onClick={() => history.push(`/health-analysis/${child.id}`)} className="edit-main-info-btn">مشاهده تحلیل کامل پرونده</button>
                </div>

                <div className="side-cards-container">
                    <div className="action-card-small" onClick={handleNavigateToGrowthChart}>
                        <div className="card-icon">📈</div>
                        <h4>نمودار رشد</h4>
                        <p>مشاهده و به‌روزرسانی</p>
                    </div>
                    <div className="action-card-small" onClick={() => history.push(`/lab-tests/${childId}`)}>
                        <div className="card-icon">🔬</div>
                        <h4>چکاپ و آزمایش‌ها</h4>
                        <p>مدیریت نتایج</p>
                    </div>
                    <div className="action-card-small" onClick={() => setIsVisitModalOpen(true)}>
                        <div className="card-icon">👨‍⚕️</div>
                        <h4>مراجعات پزشکی</h4>
                        <p>{visits.length} مراجعه ثبت شده</p>
                    </div>
                    <div className="action-card-small" onClick={() => setIsDocModalOpen(true)}>
                        <div className="card-icon">📄</div>
                        <h4>مدارک پزشکی</h4>
                        <p>{documents.length} مدرک ثبت شده</p>
                    </div>
                </div>
            </main>

            <Modal isOpen={isVisitModalOpen} onRequestClose={() => setIsVisitModalOpen(false)}>
                <h2>مراجعات پزشکی</h2>
            </Modal>
            <Modal isOpen={isDocModalOpen} onRequestClose={() => setIsDocModalOpen(false)}>
                <h2>مدارک پزشکی</h2>
            </Modal>
        </div>
    );
};

export default HealthProfilePage;
