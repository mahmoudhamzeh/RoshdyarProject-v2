import React, { useState, useEffect, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { whoStats } from '../who-stats';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIdCard, faAllergies, faStethoscope, faChartLine, faCalendarCheck, faFileMedical, faArrowUp, faArrowDown, faSyringe, faBrain } from '@fortawesome/free-solid-svg-icons';
import VaccinationStatus from './VaccinationStatus';
import SmartRecommendations from './SmartRecommendations';
import './HealthAnalysisPage.css';
import './SmartRecommendations.css';

const HealthAnalysisPage = () => {
    const history = useHistory();
    const { childId } = useParams();
    const [child, setChild] = useState(null);
    const [visits, setVisits] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [vaccinationStatus, setVaccinationStatus] = useState([]);
    const [growthTrend, setGrowthTrend] = useState({ height: 'stable', weight: 'stable', head: 'stable' });
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

            const vacRes = await fetch(`http://localhost:5000/api/vaccination-status/${childId}`);
            const vacData = await vacRes.json();
            setVaccinationStatus(vacData);

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

    const getPercentileForValue = (value, ageInMonths, gender, metric) => {
        const table = whoStats[`${metric}ForAge${gender === 'boy' ? 'Boys' : 'Girls'}`];
        if (!table) return null;

        let lowerBound, upperBound;
        for (const row of table) {
            if (row.month <= ageInMonths) lowerBound = row;
            if (row.month >= ageInMonths && !upperBound) upperBound = row;
        }

        if (!lowerBound || !upperBound) return null;

        const interpolate = (p1, p2) => {
            if (p1.month === p2.month) return p1;
            const factor = (ageInMonths - p1.month) / (p2.month - p1.month);
            return {
                P3: p1.P3 + factor * (p2.P3 - p1.P3),
                P50: p1.P50 + factor * (p2.P50 - p1.P50),
                P97: p1.P97 + factor * (p2.P97 - p1.P97),
            };
        };

        const standard = interpolate(lowerBound, upperBound);

        if (value < standard.P3) return 3;
        if (value > standard.P97) return 97;
        if (value < standard.P50) {
            return 3 + 47 * ((value - standard.P3) / (standard.P50 - standard.P3));
        } else {
            return 50 + 47 * ((value - standard.P50) / (standard.P97 - standard.P50));
        }
    };

    const TrendIndicator = ({ trend }) => {
        if (trend === 'stable') return <span className="trend-stable">روند ثابت</span>;
        if (trend === 'improving') return <span className="trend-improving">روند رو به بهبود <FontAwesomeIcon icon={faArrowUp} /></span>;
        if (trend === 'declining') return <span className="trend-declining">روند رو به کاهش <FontAwesomeIcon icon={faArrowDown} /></span>;
        return null;
    };

    useEffect(() => {
        if (child && child.growthData && child.growthData.length >= 2) {
            const sortedData = [...child.growthData].sort((a, b) => new Date(a.date) - new Date(b.date));
            const latestRecord = sortedData[sortedData.length - 1];
            const previousRecord = sortedData[sortedData.length - 2];

            const calculateAgeInMonths = (date) => (new Date(date) - new Date(child.birthDate)) / (1000 * 60 * 60 * 24 * 30.4375);

            const latestAge = calculateAgeInMonths(latestRecord.date);
            const previousAge = calculateAgeInMonths(previousRecord.date);

            const getTrend = (metric) => {
                const latestP = getPercentileForValue(latestRecord[metric], latestAge, child.gender, metric);
                const previousP = getPercentileForValue(previousRecord[metric], previousAge, child.gender, metric);

                if (latestP === null || previousP === null) return 'stable';

                const diff = latestP - previousP;
                if (Math.abs(diff) < 5) return 'stable';
                if (diff > 0) return 'improving';
                return 'declining';
            };

            setGrowthTrend({
                height: getTrend('height'),
                weight: getTrend('weight'),
                head: getTrend('headCircumference'),
            });
        }
    }, [child]);

    const renderGrowthAnalysis = () => {
        if (!child.growthData || child.growthData.length === 0) {
            return <p>اطلاعات رشدی برای تحلیل وجود ندارد.</p>;
        }
        const latestRecord = child.growthData[child.growthData.length - 1];
        return (
            <div>
                <p><strong>قد:</strong> {latestRecord.height} cm (<TrendIndicator trend={growthTrend.height} />)</p>
                <p><strong>وزن:</strong> {latestRecord.weight} kg (<TrendIndicator trend={growthTrend.weight} />)</p>
                {latestRecord.headCircumference && <p><strong>دور سر:</strong> {latestRecord.headCircumference} cm (<TrendIndicator trend={growthTrend.head} />)</p>}
            </div>
        );
    }

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
                     <div className="analysis-card full-width-card">
                        <h3><FontAwesomeIcon icon={faBrain} /> توصیه‌های هوشمند</h3>
                        <SmartRecommendations child={child} growthTrend={growthTrend} vaccinationStatus={vaccinationStatus} />
                    </div>
                    <div className="analysis-card">
                        <h3><FontAwesomeIcon icon={faIdCard} /> اطلاعات پایه</h3>
                        <p><strong>نام:</strong> {child.name}</p>
                        <p><strong>سن:</strong> {age.years} سال و {age.months} ماه</p>
                        <p><strong>جنسیت:</strong> {child.gender === 'boy' ? 'پسر' : 'دختر'}</p>
                        <p><strong>گروه خونی:</strong> {child.bloodType}</p>
                    </div>
                    <div className="analysis-card">
                        <h3><FontAwesomeIcon icon={faAllergies} /> آلرژی‌ها</h3>
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
                        <h3><FontAwesomeIcon icon={faStethoscope} /> بیماری‌های خاص</h3>
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
                        <h3><FontAwesomeIcon icon={faChartLine} /> تحلیل رشد</h3>
                        {renderGrowthAnalysis()}
                    </div>
                    <div className="analysis-card full-width-card">
                        <h3><FontAwesomeIcon icon={faCalendarCheck} /> تاریخچه مراجعات پزشکی</h3>
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
                        <h3><FontAwesomeIcon icon={faFileMedical} /> مدارک پزشکی</h3>
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
                    <div className="analysis-card full-width-card">
                        <h3><FontAwesomeIcon icon={faSyringe} /> وضعیت واکسیناسیون</h3>
                        <VaccinationStatus />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HealthAnalysisPage;
