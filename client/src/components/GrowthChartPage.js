import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import Modal from 'react-modal';
import "react-datepicker/dist/react-datepicker.css";
import './GrowthChartPage.css';
import { whoStats } from '../who-stats';

Modal.setAppElement('#root');

const GrowthChartPage = () => {
    const history = useHistory();
    const { childId: urlChildId } = useParams();

    const [children, setChildren] = useState([]);
    const [selectedChildId, setSelectedChildId] = useState(null);
    const [growthData, setGrowthData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newRecord, setNewRecord] = useState({ date: new Date(), height: '', weight: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/children');
                const data = await res.json();
                if (data && data.length > 0) {
                    setChildren(data);
                    const initialChildId = urlChildId || data[0].id;
                    setSelectedChildId(initialChildId);
                    if (!urlChildId) {
                        history.replace(`/growth-chart/${initialChildId}`);
                    }
                } else {
                    setError('کودکی یافت نشد. لطفاً ابتدا یک کودک اضافه کنید.');
                }
            } catch (err) {
                setError('خطا در دریافت لیست کودکان.');
            }
        };
        fetchChildren();
    }, [urlChildId, history]);

    useEffect(() => {
        if (selectedChildId) {
            const fetchGrowthData = async () => {
                try {
                    const res = await fetch(`http://localhost:5000/api/growth/${selectedChildId}`);
                    const data = await res.json();
                    setGrowthData(data);
                } catch (err) {
                    setError('خطا در دریافت اطلاعات رشد.');
                }
            };
            fetchGrowthData();
        }
    }, [selectedChildId]);

    const handleChildChange = (e) => {
        const newChildId = e.target.value;
        setSelectedChildId(newChildId);
        history.push(`/growth-chart/${newChildId}`);
    };

    const handleAddRecord = async () => {
        if (!newRecord.date || !newRecord.height || !newRecord.weight) {
            alert('لطفاً تمام فیلدها را پر کنید.');
            return;
        }
        try {
            const response = await fetch(`http://localhost:5000/api/growth/${selectedChildId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newRecord,
                    date: newRecord.date.toISOString().split('T')[0].replace(/-/g, '/')
                }),
            });
            if (response.ok) {
                const addedRecord = await response.json();
                setGrowthData(prevData => [...prevData, addedRecord].sort((a, b) => new Date(a.date) - new Date(b.date)));
                setIsModalOpen(false);
                setNewRecord({ date: new Date(), height: '', weight: '' });
            } else {
                alert('خطا در افزودن رکورد.');
            }
        } catch (err) {
            alert('خطا در ارتباط با سرور.');
        }
    };
    
    const getWHOData = (gender, measurement) => {
        if (!gender || !measurement) return [];
        const stats = whoStats[measurement][gender];
        return stats.map(s => ({ month: s.month, p3: s.p3, p15: s.p15, p50: s.p50, p85: s.p85, p97: s.p97 }));
    };

    const selectedChild = children.find(c => c.id === parseInt(selectedChildId));

    const calculateMonths = (birthDate, recordDate) => {
        if (!birthDate || !recordDate) return 0;
        const birth = new Date(birthDate);
        const record = new Date(recordDate);
        return (record.getFullYear() - birth.getFullYear()) * 12 + (record.getMonth() - birth.getMonth());
    };

    const combinedHeightData = growthData.map(d => ({
        month: calculateMonths(selectedChild?.birthDate, d.date),
        height: d.height,
    }));
    
    const combinedWeightData = growthData.map(d => ({
        month: calculateMonths(selectedChild?.birthDate, d.date),
        weight: d.weight,
    }));

    if (error) return <div className="error-message" style={{ padding: '2rem', textAlign: 'center' }}>{error}</div>;
    if (children.length === 0 || !selectedChild) return <p style={{ padding: '2rem', textAlign: 'center' }}>در حال بارگذاری...</p>;

    return (
        <div className="growth-chart-page">
            <nav className="page-nav-final">
                <button onClick={() => history.push('/dashboard')} className="back-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    <span>داشبورد</span>
                </button>
                <h1>نمودار رشد</h1>
                <div className="child-selector">
                    <label htmlFor="child-select">انتخاب کودک:</label>
                    <select id="child-select" value={selectedChildId} onChange={handleChildChange}>
                        {children.map(child => (
                            <option key={child.id} value={child.id}>{child.name}</option>
                        ))}
                    </select>
                </div>
            </nav>

            <div className="charts-container">
                <div className="chart-wrapper">
                    <h3>نمودار قد به سن ({selectedChild.name})</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={getWHOData(selectedChild.gender, 'height')}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" dataKey="month" name="سن (ماه)" domain={[0, 24]}/>
                            <YAxis name="قد (سانتی‌متر)" />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="p3" stroke="#ffc658" dot={false} name="صدک ۳" />
                            <Line type="monotone" dataKey="p50" stroke="#82ca9d" dot={false} name="صدک ۵۰" />
                            <Line type="monotone" dataKey="p97" stroke="#8884d8" dot={false} name="صدک ۹۷" />
                            <Line type="monotone" dataKey="height" data={combinedHeightData} stroke="#ff0000" strokeWidth={2} name="قد کودک" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-wrapper">
                    <h3>نمودار وزن به سن ({selectedChild.name})</h3>
                    <ResponsiveContainer width="100%" height={400}>
                         <LineChart data={getWHOData(selectedChild.gender, 'weight')}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" dataKey="month" name="سن (ماه)" domain={[0, 24]}/>
                            <YAxis name="وزن (کیلوگرم)" />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="p3" stroke="#ffc658" dot={false} name="صدک ۳" />
                            <Line type="monotone" dataKey="p50" stroke="#82ca9d" dot={false} name="صدک ۵۰" />
                            <Line type="monotone" dataKey="p97" stroke="#8884d8" dot={false} name="صدک ۹۷" />
                            <Line type="monotone" dataKey="weight" data={combinedWeightData} stroke="#ff0000" strokeWidth={2} name="وزن کودک" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <button onClick={() => setIsModalOpen(true)} className="add-record-btn">افزودن رکورد جدید</button>

            <Modal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} className="modal-content" overlayClassName="modal-overlay">
                <h2>افزودن رکورد جدید برای {selectedChild.name}</h2>
                <div className="form-group">
                    <label>تاریخ</label>
                    <DatePicker selected={newRecord.date} onChange={date => setNewRecord(p => ({...p, date}))} dateFormat="yyyy/MM/dd" />
                </div>
                <div className="form-group">
                    <label>قد (سانتی‌متر)</label>
                    <input type="number" value={newRecord.height} onChange={e => setNewRecord(p => ({...p, height: e.target.value}))} placeholder="مثال: ۵۵" />
                </div>
                <div className="form-group">
                    <label>وزن (کیلوگرم)</label>
                    <input type="number" value={newRecord.weight} onChange={e => setNewRecord(p => ({...p, weight: e.target.value}))} placeholder="مثال: ۴.۵" />
                </div>
                <div className="modal-actions">
                    <button onClick={handleAddRecord} className="btn-save">ذخیره</button>
                    <button onClick={() => setIsModalOpen(false)} className="btn-cancel">لغو</button>
                </div>
            </Modal>
        </div>
    );
};

export default GrowthChartPage;
