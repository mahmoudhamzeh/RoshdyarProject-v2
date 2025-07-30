import React, { useState, useEffect, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import DatePicker from 'react-datepicker';
import { whoStats } from '../who-stats';
import './GrowthChartPage.css';

const GrowthChartPage = () => {
    const history = useHistory();
    const { childId } = useParams();
    const [child, setChild] = useState(null);
    const [chartType, setChartType] = useState('height');
    const [isAddingData, setIsAddingData] = useState(false);
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
            setIsAddingData(false);
            setNewRecord({ date: new Date(), value: '' });
        } catch (error) {
            alert(error.message);
        }
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


    return (
        <div className="growth-chart-page">
            <nav className="page-nav-final">
                <button onClick={() => history.goBack()} className="back-btn">
                    &larr; بازگشت
                </button>
                <h1>نمودار رشد {child.name}</h1>
                <div className="nav-placeholder"></div>
            </nav>

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
                <button onClick={() => setIsAddingData(!isAddingData)} className="add-data-toggle">
                    {isAddingData ? 'لغو' : '+ افزودن داده جدید'}
                </button>
                {isAddingData && (
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
                            placeholder={`مقدار ${chartType === 'height' ? 'قد' : 'وزن'}`}
                        />
                        <button onClick={handleAddData}>ذخیره</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GrowthChartPage;
