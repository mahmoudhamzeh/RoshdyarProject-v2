import React, { useState, useEffect, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import DatePicker from 'react-datepicker';
import Modal from 'react-modal';
import { whoStats } from '../who-stats';
import './GrowthChartPage.css';

Modal.setAppElement('#root');

const legendTooltips = {
    'صدک ۳': '۳٪ از کودکان هم‌سن و هم‌جنس، مقداری کمتر از این خط دارند.',
    'صدک ۵۰ (میانه)': 'نقطه میانی رشد؛ ۵۰٪ از کودکان مقداری کمتر و ۵۰٪ مقداری بیشتر از این خط دارند.',
    'صدک ۹۷': '۹۷٪ از کودکان هم‌سن و هم‌جنس، مقداری کمتر از این خط دارند.'
};

const CustomLegend = (props) => {
    const { payload } = props;
    return (
        <ul className="custom-legend">
            {payload.map((entry, index) => {
                const childNameEntry = entry.value === props.childName;
                if (childNameEntry) {
                    return (
                        <li key={`item-${index}`} style={{ color: entry.color }}>
                           {entry.value} (داده‌های شما)
                        </li>
                    );
                }
                return (
                    <li key={`item-${index}`} style={{ color: entry.color }} title={legendTooltips[entry.value] || ''}>
                        {entry.value}
                    </li>
                );
            })}
        </ul>
    );
};


const GrowthChart = ({ data, standardData, childName, yAxisLabel, childAgeInMonths }) => (
    <ResponsiveContainer width="100%" height={300}>
        <LineChart margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
                type="number"
                dataKey="month"
                domain={[0, 60]}
                ticks={[0, 6, 12, 18, 24, 36, 48, 60]}
                label={{ value: "سن (ماه)", position: "insideBottom", offset: -15 }}
            />
            <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
            <Tooltip
                formatter={(value, name) => {
                    if (name === childName) return [value, childName];
                    return [value, name];
                }}
            />
            <Legend content={<CustomLegend childName={childName} />} />
            <Line type="monotone" dataKey="P3" data={standardData} stroke="#ff7300" name="صدک ۳" dot={false} />
            <Line type="monotone" dataKey="P50" data={standardData} stroke="#387908" name="صدک ۵۰ (میانه)" dot={false} />
            <Line type="monotone" dataKey="P97" data={standardData} stroke="#0095ff" name="صدک ۹۷" dot={false} />
            <Line type="monotone" dataKey="value" data={data} stroke="#e60000" name={childName} strokeWidth={2} />
            <ReferenceLine x={childAgeInMonths} stroke="red" label={{ value: "سن فعلی", position: "insideTopRight" }} />
        </LineChart>
    </ResponsiveContainer>
);

const GrowthChartPage = () => {
    const history = useHistory();
    const { childId } = useParams();
    const [child, setChild] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [newRecord, setNewRecord] = useState({ date: new Date(), height: '', weight: '' });

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
        if (!newRecord.height && !newRecord.weight) {
            alert('حداقل قد یا وزن را وارد کنید.');
            return;
        }

        const updatedGrowthData = [
            ...(child.growthData || []),
            {
                date: newRecord.date.toISOString().split('T')[0],
                height: newRecord.height ? parseFloat(newRecord.height) : undefined,
                weight: newRecord.weight ? parseFloat(newRecord.weight) : undefined,
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
            setNewRecord({ date: new Date(), height: '', weight: '' });
        } catch (error) {
            alert(error.message);
        }
    };

    const getGrowthStatus = (value, standardData) => {
        if (!child || !child.birthDate || !value || !standardData || standardData.length === 0) return { text: 'نامشخص', className: 'status-unknown' };
        
        const childAgeInMonths = (new Date() - new Date(child.birthDate)) / (1000 * 60 * 60 * 24 * 30.4375);
        const closestMonthData = standardData.reduce((prev, curr) => 
            Math.abs(curr.month - childAgeInMonths) < Math.abs(prev.month - childAgeInMonths) ? curr : prev
        );

        if (value < closestMonthData.P3) return { text: 'پایین‌تر از نرمال', className: 'status-low' };
        if (value > closestMonthData.P97) return { text: 'بالاتر از نرمال', className: 'status-high' };
        return { text: 'نرمال', className: 'status-normal' };
    };

    if (!child) return <p>در حال بارگذاری...</p>;

    const childAgeInMonths = child.birthDate ? (new Date() - new Date(child.birthDate)) / (1000 * 60 * 60 * 24 * 30.4375) : 0;

    const formattedHeightData = child.birthDate ? (child.growthData || []).map(d => ({
        month: (new Date(d.date) - new Date(child.birthDate)) / (1000 * 60 * 60 * 24 * 30.4375),
        value: d.height,
    })).filter(d => d.value !== undefined).sort((a, b) => a.month - b.month) : [];
    
    const formattedWeightData = child.birthDate ? (child.growthData || []).map(d => ({
        month: (new Date(d.date) - new Date(child.birthDate)) / (1000 * 60 * 60 * 24 * 30.4375),
        value: d.weight,
    })).filter(d => d.value !== undefined).sort((a, b) => a.month - b.month) : [];

    const lastHeight = formattedHeightData.length > 0 ? formattedHeightData[formattedHeightData.length - 1].value : null;
    const lastWeight = formattedWeightData.length > 0 ? formattedWeightData[formattedWeightData.length - 1].value : null;

    const heightStatus = getGrowthStatus(lastHeight, whoStats.heightForAgeBoys);
    const weightStatus = getGrowthStatus(lastWeight, whoStats.weightForAgeBoys);


    return (
        <div className="growth-chart-page">
            <nav className="page-nav-final">
                <button onClick={() => history.goBack()} className="back-btn">
                    &larr; بازگشت به پرونده
                </button>
                <h1>نمودار رشد {child.name}</h1>
                <div className="nav-placeholder"></div>
            </nav>

            <div className="chart-info-boxes">
                <div className={`info-box ${heightStatus.className}`}>
                    <h4>آخرین قد ثبت شده</h4>
                    <p>{lastHeight || 'N/A'} cm</p>
                    <span>وضعیت: {heightStatus.text}</span>
                </div>
                <div className={`info-box ${weightStatus.className}`}>
                    <h4>آخرین وزن ثبت شده</h4>
                    <p>{lastWeight || 'N/A'} kg</p>
                    <span>وضعیت: {weightStatus.text}</span>
                </div>
            </div>
            
            <div className="chart-section">
                <h3>نمودار قد به سن</h3>
                <GrowthChart 
                    data={formattedHeightData}
                    standardData={child.gender === 'boy' ? whoStats.heightForAgeBoys : whoStats.heightForAgeGirls}
                    childName={child.name}
                    yAxisLabel="قد (cm)"
                    childAgeInMonths={childAgeInMonths}
                />
            </div>
            
            <div className="chart-section">
                <h3>نمودار وزن به سن</h3>
                <GrowthChart 
                    data={formattedWeightData}
                    standardData={child.gender === 'boy' ? whoStats.weightForAgeBoys : whoStats.weightForAgeGirls}
                    childName={child.name}
                    yAxisLabel="وزن (kg)"
                    childAgeInMonths={childAgeInMonths}
                />
            </div>

            <div className="data-entry-section">
                <button onClick={() => setModalIsOpen(true)} className="add-data-btn">
                    + افزودن داده جدید
                </button>
            </div>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={() => setModalIsOpen(false)}
                contentLabel="Add Data Modal"
                className="add-data-modal"
                overlayClassName="modal-overlay"
            >
                <h2>افزودن داده جدید</h2>
                <div className="add-data-form">
                    <DatePicker
                        selected={newRecord.date}
                        onChange={(date) => setNewRecord(prev => ({ ...prev, date }))}
                        dateFormat="yyyy/MM/dd"
                    />
                    <input
                        type="number"
                        value={newRecord.height}
                        onChange={(e) => setNewRecord(prev => ({ ...prev, height: e.target.value }))}
                        placeholder="قد (cm)"
                    />
                    <input
                        type="number"
                        value={newRecord.weight}
                        onChange={(e) => setNewRecord(prev => ({ ...prev, weight: e.target.value }))}
                        placeholder="وزن (kg)"
                    />
                </div>
                <div className="modal-actions">
                    <button onClick={handleAddData}>ذخیره</button>
                    <button onClick={() => setModalIsOpen(false)}>انصراف</button>
                </div>
            </Modal>
        </div>
    );
};

export default GrowthChartPage;
