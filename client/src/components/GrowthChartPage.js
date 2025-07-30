import React, { useState, useEffect, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import DatePicker from 'react-datepicker';
import Modal from 'react-modal';
import { whoStats } from '../who-stats';
import './GrowthChartPage.css';

Modal.setAppElement('#root');

const GrowthChartPage = () => {
    const history = useHistory();
    const { childId } = useParams();
    const [child, setChild] = useState(null);
    const [chartType, setChartType] = useState('height');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [newRecord, setNewRecord] = useState({ date: new Date(), value: '' });

    const fetchChildData = useCallback(async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/children/${childId}`);
            if (!response.ok) throw new Error('Child not found');
            const data = await response.json();
            setChild(data);
        } catch (error) {
            history.push('/my-children');
        }
    }, [childId, history]);

    useEffect(() => {
        fetchChildData();
    }, [fetchChildData]);

    const handleAddData = async () => {
        if (!newRecord.value) {
            alert('لطفا مقدار را وارد کنید.');
            return;
        }

        const updatedGrowthData = [
            ...(child.growthData || []),
            {
                date: newRecord.date.toISOString().split('T')[0],
                [chartType]: parseFloat(newRecord.value)
            }
        ];

        try {
            const response = await fetch(`http://localhost:5000/api/children/${childId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...child, growthData: updatedGrowthData }),
            });
            if (!response.ok) throw new Error('Failed to update data');
            fetchChildData(); // Refresh data
            setModalIsOpen(false);
            setNewRecord({ date: new Date(), value: '' });
        } catch (error) {
            alert(error.message);
        }
    };

    const getGrowthStatus = (value, standardData) => {
        if (!value || !standardData || standardData.length === 0) return 'نامشخص';
        const lastStandard = standardData[standardData.length - 1];
        if (value < lastStandard.P3) return 'پایین‌تر از نرمال';
        if (value > lastStandard.P97) return 'بالاتر از نرمال';
        return 'نرمال';
    };

    if (!child) return <p>در حال بارگذاری...</p>;

    const getStandardData = () => {
        if (!child) return [];
        if (chartType === 'height') {
            return child.gender === 'boy' ? whoStats.heightForAgeBoys : whoStats.heightForAgeGirls;
        }
        return child.gender === 'boy' ? whoStats.weightForAgeBoys : whoStats.weightForAgeGirls;
    };

    const standardData = getStandardData();
    const childAgeInMonths = child.birthDate ? (new Date() - new Date(child.birthDate)) / (1000 * 60 * 60 * 24 * 30.4375) : 0;

    const formattedChildData = child.birthDate ? (child.growthData || []).map(d => ({
        month: (new Date(d.date) - new Date(child.birthDate)) / (1000 * 60 * 60 * 24 * 30.4375),
        value: d[chartType],
        date: d.date,
    })).filter(d => d.value !== undefined).sort((a, b) => a.month - b.month) : [];

    const lastRecord = formattedChildData.length > 0 ? formattedChildData[formattedChildData.length - 1] : null;
    const status = lastRecord ? getGrowthStatus(lastRecord.value, standardData) : 'داده‌ای ثبت نشده';

    return (
        <div className="growth-chart-page">
            <nav className="page-nav-final">
                <button onClick={() => history.goBack()} className="back-btn">
                    &larr; بازگشت
                </button>
                <h1>نمودار رشد {child.name}</h1>
                <div className="nav-placeholder"></div>
            </nav>

            <div className="chart-info-boxes">
                <div className="info-box">
                    <h4>آخرین قد ثبت شده</h4>
                    <p>{child.height || 'N/A'} cm</p>
                    <span>وضعیت: {getGrowthStatus(child.height, whoStats.heightForAgeBoys)}</span>
                </div>
                <div className="info-box">
                    <h4>آخرین وزن ثبت شده</h4>
                    <p>{child.weight || 'N/A'} kg</p>
                    <span>وضعیت: {getGrowthStatus(child.weight, whoStats.weightForAgeBoys)}</span>
                </div>
            </div>

            <div className="chart-controls">
                <button onClick={() => setChartType('height')} className={chartType === 'height' ? 'active' : ''}>قد</button>
                <button onClick={() => setChartType('weight')} className={chartType === 'weight' ? 'active' : ''}>وزن</button>
            </div>

            <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            type="number"
                            dataKey="month"
                            domain={[0, 60]}
                            ticks={[0, 6, 12, 18, 24, 36, 48, 60]}
                            label={{ value: "سن (ماه)", position: "insideBottom", offset: -15 }}
                        />
                        <YAxis label={{ value: chartType === 'height' ? 'قد (cm)' : 'وزن (kg)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip
                            formatter={(value, name, props) => {
                                if (name === 'value') return [value, child.name];
                                return [value, name];
                            }}
                        />
                        <Legend />

                        <Line type="monotone" dataKey="P3" data={standardData} stroke="#ff7300" name="صدک ۳" dot={false} />
                        <Line type="monotone" dataKey="P50" data={standardData} stroke="#387908" name="صدک ۵۰ (میانه)" dot={false} />
                        <Line type="monotone" dataKey="P97" data={standardData} stroke="#0095ff" name="صدک ۹۷" dot={false} />

                        <Line type="monotone" dataKey="value" data={formattedChildData} stroke="#e60000" name={child.name} strokeWidth={2} />

                        <ReferenceLine x={childAgeInMonths} stroke="red" label={{ value: "سن فعلی", position: "insideTopRight" }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="data-entry-section">
                <button onClick={() => setModalIsOpen(true)} className="add-data-toggle">
                    + افزودن داده جدید
                </button>
                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={() => setModalIsOpen(false)}
                    contentLabel="Add Data Modal"
                    className="add-data-modal"
                    overlayClassName="modal-overlay"
                >
                    <h2>افزودن داده جدید برای {chartType === 'height' ? 'قد' : 'وزن'}</h2>
                    <div className="add-data-form">
                        <DatePicker
                            selected={newRecord.date}
                            onChange={(date) => setNewRecord(prev => ({ ...prev, date }))}
                            dateFormat="yyyy/MM/dd"
                        />
                        <input
                            type="number"
                            value={newRecord.value}
                            onChange={(e) => setNewRecord(prev => ({ ...prev, value: e.target.value }))}
                            placeholder={`مقدار`}
                        />
                    </div>
                    <div className="modal-actions">
                        <button onClick={handleAddData}>ذخیره</button>
                        <button onClick={() => setModalIsOpen(false)}>انصراف</button>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default GrowthChartPage;
