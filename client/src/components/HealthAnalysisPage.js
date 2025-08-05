import React, { useState, useEffect, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { whoStats } from '../who-stats';
import './HealthAnalysisPage.css';

const HealthAnalysisPage = () => {
    const history = useHistory();
    const { childId } = useParams();
    const [child, setChild] = useState(null);
    const [visits, setVisits] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
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
            console.error("Failed to fetch data:", error);
            history.push('/my-children');
        } finally {
            setIsLoading(false);
        }
    }, [childId, history]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    if (isLoading) {
        return <p>در حال بارگذاری تحلیل...</p>;
    }

    if (!child) {
        return <p>اطلاعاتی برای نمایش وجود ندارد.</p>;
    }

    const calculateAge = (birthDate) => {
        if (!birthDate) return { years: 0, months: 0 };
        const today = new Date();
        const birthDateObj = new Date(birthDate);
        let years = today.getFullYear() - birthDateObj.getFullYear();
        let months = today.getMonth() - birthDateObj.getMonth();
        if (months < 0 || (months === 0 && today.getDate() < birthDateObj.getDate())) {
            years--;
            months = (12 + months) % 12;
        }
        return { years, months };
    };

    const age = calculateAge(child.birthDate);

    const getGrowthAnalysis = () => {
        if (!child.growthData || child.growthData.length === 0) {
            return <p>اطلاعات رشدی برای تحلیل وجود ندارد.</p>;
        }

        const latestRecord = child.growthData[child.growthData.length - 1];
        const ageInMonths = age.years * 12 + age.months;

        const findPercentile = (value, gender, metric) => {
            const table = whoStats[`${metric}ForAge${gender === 'boy' ? 'Boys' : 'Girls'}`];
            if (!table) return 'N/A';

            let lowerBound = null;
            let upperBound = null;

            for (const row of table) {
                if (row.month <= ageInMonths) {
                    lowerBound = row;
                }
                if (row.month >= ageInMonths && !upperBound) {
                    upperBound = row;
                }
            }

            const standard = lowerBound || upperBound; // Use closest available data
            if (!standard) return 'اطلاعاتی برای این سن موجود نیست';

            if (value < standard.P3) return `پایین‌تر از صدک 3 (کمبود)`;
            if (value > standard.P97) return `بالاتر از صدک 97 (اضافه)`;
            if (value >= standard.P3 && value < standard.P50) return `بین صدک 3 و 50 (نرمال)`;
            if (value >= standard.P50 && value <= standard.P97) return `بین صدک 50 و 97 (نرمال)`;

            return 'نرمال';
        };

        return (
            <>
                <p><strong>قد:</strong> {latestRecord.height} cm - {findPercentile(latestRecord.height, child.gender, 'height')}</p>
                <p><strong>وزن:</strong> {latestRecord.weight} kg - {findPercentile(latestRecord.weight, child.gender, 'weight')}</p>
                {latestRecord.headCircumference && <p><strong>دور سر:</strong> {latestRecord.headCircumference} cm - {findPercentile(latestRecord.headCircumference, child.gender, 'headCircumference')}</p>}
            </>
        );
    };

    return (
        <div className="health-analysis-page">
            <nav className="page-nav-final">
                <button onClick={() => history.goBack()} className="back-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    <span>بازگشت</span>
                </button>
                <h1>تحلیل پرونده سلامت - {child.name}</h1>
                <div className="nav-placeholder"></div>
            </nav>
            <main className="analysis-content">
                <div className="analysis-grid">
                    <div className="analysis-card">
                        <h3>اطلاعات پایه</h3>
                        <p><strong>نام:</strong> {child.name}</p>
                        <p><strong>سن:</strong> {age.years} سال و {age.months} ماه</p>
                        <p><strong>جنسیت:</strong> {child.gender === 'boy' ? 'پسر' : 'دختر'}</p>
                        <p><strong>گروه خونی:</strong> {child.bloodType}</p>
                    </div>
                    <div className="analysis-card">
                        <h3>آلرژی‌ها</h3>
                        {child.allergies && child.allergies.types && Object.entries(child.allergies.types).filter(([_, v]) => v).length > 0 ? (
                            <>
                                <div className="tags-container">
                                    {Object.entries(child.allergies.types).filter(([_, v]) => v).map(([k]) => <span key={k} className="tag allergy-tag">{k}</span>)}
                                </div>
                                {child.allergies.description && <p><strong>توضیحات:</strong> {child.allergies.description}</p>}
                            </>
                        ) : <p>هیچ آلرژی ثبت نشده است.</p>}
                    </div>
                    <div className="analysis-card">
                        <h3>بیماری‌های خاص</h3>
                        {child.special_illnesses && child.special_illnesses.types && Object.entries(child.special_illnesses.types).filter(([_, v]) => v).length > 0 ? (
                            <>
                                <div className="tags-container">
                                    {Object.entries(child.special_illnesses.types).filter(([_, v]) => v).map(([k]) => <span key={k} className="tag illness-tag">{k}</span>)}
                                </div>
                                {child.special_illnesses.description && <p><strong>توضیحات:</strong> {child.special_illnesses.description}</p>}
                            </>
                        ) : <p>هیچ بیماری خاصی ثبت نشده است.</p>}
                    </div>
                    <div className="analysis-card">
                        <h3>تحلیل رشد</h3>
                        {getGrowthAnalysis()}
                    </div>
                    <div className="analysis-card full-width-card">
                        <h3>تاریخچه مراجعات پزشکی</h3>
                        {visits.length > 0 ? (
                            <ul className="visits-list">
                                {visits.map(visit => (
                                    <li key={visit.id}>
                                        <span className="visit-date">{new Date(visit.date).toLocaleDateString('fa-IR')}</span>
                                        <span className="visit-reason">{visit.reason}</span>
                                        <p className="visit-description">{visit.description}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : <p>هیچ مراجعه‌ای ثبت نشده است.</p>}
                    </div>
                    <div className="analysis-card full-width-card">
                        <h3>مدارک پزشکی</h3>
                        {documents.length > 0 ? (
                            <ul className="documents-list">
                                {documents.map(doc => (
                                    <li key={doc.id}>
                                        <a href={`http://localhost:5000${doc.url}`} target="_blank" rel="noopener noreferrer">{doc.title}</a>
                                        <span className="doc-date">{new Date(doc.date).toLocaleDateString('fa-IR')}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <p>هیچ مدرکی ثبت نشده است.</p>}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HealthAnalysisPage;
