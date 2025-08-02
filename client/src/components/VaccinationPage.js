import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { addMonths, format } from 'date-fns';
import { faCheckCircle, faTimesCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './VaccinationPage.css';

const vaccineSchedule = [
    { name: 'BCG + OPV (قطره فلج اطفال)', dose: 'نوبت اول', dueAgeMonths: 0, type: 'تزریقی/خوراکی' },
    { name: 'پنتاوالان (DTP, Hib, HepB) + OPV', dose: 'نوبت دوم', dueAgeMonths: 2, type: 'تزریقی/خوراکی' },
    { name: 'پنتاوالان + OPV', dose: 'نوبت سوم', dueAgeMonths: 4, type: 'تزریقی/خوراکی' },
    { name: 'پنتاوالان + IPV (فلج اطفال تزریقی)', dose: 'نوبت چهارم', dueAgeMonths: 6, type: 'تزریقی' },
    { name: 'MMR (سرخک، اوریون، سرخجه)', dose: 'نوبت پنجم', dueAgeMonths: 12, type: 'تزریقی' },
    { name: 'سه گانه (DTP) + OPV', dose: 'یادآور اول', dueAgeMonths: 18, type: 'تزریقی/خوراکی' },
    { name: 'سه گانه + OPV', dose: 'یادآور دوم', dueAgeMonths: 72, type: 'تزریقی/خوراکی' } // 6 years
];

const vaccineDetails = {
    'BCG + OPV (قطره فلج اطفال)': {
        usage: 'پیشگیری از سل و فلج اطفال.',
        injectionTime: 'بدو تولد',
        symptoms: 'تب خفیف، بی‌قراری، تورم و قرمزی در محل تزریق.',
        care: 'استفاده از کمپرس سرد در محل تزریق، در صورت تب بالا یا علائم شدید به پزشک مراجعه شود.'
    },
    'پنتاوالان (DTP, Hib, HepB) + OPV': {
        usage: 'پیشگیری از دیفتری، کزاز، سیاه‌سرفه، هموفیلوس آنفولانزا نوع B و هپاتیت B.',
        injectionTime: '۲، ۴ و ۶ ماهگی',
        symptoms: 'تب، درد و تورم در محل تزریق، بی‌قراری و گریه.',
        care: 'دادن قطره استامینوفن طبق دستور پزشک، استفاده از کمپرس سرد و سپس گرم.'
    },
    'MMR (سرخک، اوریون، سرخجه)': {
        usage: 'پیشگیری از سرخک، اوریون و سرخجه.',
        injectionTime: '۱۲ ماهگی و ۱۸ ماهگی (در برخی برنامه‌ها)',
        symptoms: 'تب، بثورات جلدی خفیف ۷ تا ۱۰ روز پس از تزریق.',
        care: 'مایعات فراوان، استراحت. نیازی به اقدام خاصی نیست مگر علائم شدید باشد.'
    }
    // Add other details as needed
};

const VaccinationPage = () => {
    const { childId } = useParams();
    const history = useHistory();
    const [child, setChild] = useState(null);
    const [selectedVaccine, setSelectedVaccine] = useState(null);
    const [reminder, setReminder] = useState({ active: false, daysBefore: 7 });


    useEffect(() => {
        const fetchChildData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/children/${childId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch child data.');
                }
                const data = await response.json();

                // If the server provides 'name' instead of 'firstName'/'lastName', split it.
                if (data.name && !data.firstName) {
                    const nameParts = data.name.split(' ');
                    data.firstName = nameParts[0];
                    data.lastName = nameParts.slice(1).join(' ');
                }

                setChild(data);

            } catch (error) {
                console.error(error);
                alert('خطا در بارگذاری اطلاعات کودک.');
            }
        };

        fetchChildData();
    }, [childId]);

    if (!child) {
        return <div>در حال بارگذاری اطلاعات...</div>;
    }

    return (
        <div className="vaccination-page">
            <nav className="page-nav-final">
                <button onClick={() => history.push('/dashboard')} className="back-btn">&larr;</button>
                <h1>کارت واکسیناسیون</h1>
                <div className="nav-placeholder"></div>
            </nav>

            <div className="content-container">
                {/* Child Info Section will go here */}
                <section className="child-info-section">
                    <h2>اطلاعات کودک</h2>
                    <div className="info-grid">
                        <div className="info-item"><strong>نام:</strong> {child.firstName}</div>
                        <div className="info-item"><strong>نام خانوادگی:</strong> {child.lastName}</div>
                        <div className="info-item"><strong>تاریخ تولد:</strong> {child.birthDate}</div>
                        <div className="info-item"><strong>کد ملی:</strong> {child.nationalId}</div>
                        <div className="info-item"><strong>جنسیت:</strong> {child.gender}</div>
                        <div className="info-item"><strong>نام پدر:</strong> {child.fatherName}</div>
                    </div>
                    <h3>اطلاعات مربوط به تولد</h3>
                    <div className="info-grid">
                        <div className="info-item"><strong>وزن (g):</strong> {child.birthWeight}</div>
                        <div className="info-item"><strong>قد (cm):</strong> {child.birthHeight}</div>
                        <div className="info-item"><strong>دور سر (cm):</strong> {child.birthHeadCircumference}</div>
                        <div className="info-item"><strong>نوع زایمان:</strong> {child.birthType}</div>
                        <div className="info-item"><strong>سن بارداری (هفته):</strong> {child.gestationalAge}</div>
                        <div className="info-item"><strong>محل تولد:</strong> {child.birthPlace}</div>
                        <div className="info-item"><strong>آپگار دقیقه ۱:</strong> {child.apgar1}</div>
                        <div className="info-item"><strong>آپگار دقیقه ۵:</strong> {child.apgar5}</div>
                    </div>
                </section>

                {/* Vaccination Table Section will go here */}
                <section className="vaccine-table-section">
                    <h2>جدول واکسیناسیون</h2>
                    <div className="vaccine-table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>نام واکسن</th>
                                    <th>نوبت</th>
                                    <th>سن موعود</th>
                                    <th>تاریخ موعود</th>
                                    <th>وضعیت</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vaccineSchedule.map((vaccine, index) => {
                                    const dueDate = addMonths(new Date(child.birthDate), vaccine.dueAgeMonths);
                                    const today = new Date();
                                    let status = 'آینده';
                                    let statusIcon = faCheckCircle; // Placeholder

                                    // A real implementation would check against actual vaccination records
                                    // For now, we'll just determine status based on date
                                    if (dueDate < today) {
                                        status = 'تزریق شده/گذشته';
                                        statusIcon = faCheckCircle;
                                    } else if (dueDate > today) {
                                        status = 'آینده';
                                        statusIcon = faTimesCircle; // Placeholder, should be a different icon
                                    }

                                    // Simple check for "due soon" (e.g., within 30 days)
                                    const diffDays = (dueDate - today) / (1000 * 60 * 60 * 24);
                                    if (diffDays > 0 && diffDays <= 30) {
                                        status = 'نزدیک';
                                        statusIcon = faExclamationTriangle;
                                    }

                                    return (
                                        <tr key={index} onClick={() => setSelectedVaccine(vaccine)} className={selectedVaccine?.name === vaccine.name ? 'selected-row' : ''}>
                                            <td>{vaccine.name}</td>
                                            <td>{vaccine.dose}</td>
                                            <td>{vaccine.dueAgeMonths === 0 ? 'بدو تولد' : `${vaccine.dueAgeMonths} ماهگی`}</td>
                                            <td>{format(dueDate, 'yyyy/MM/dd')}</td>
                                            <td className={`status-${status}`}>
                                                <FontAwesomeIcon icon={statusIcon} />
                                                <span>{status}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Vaccine Details Section */}
                <section className="vaccine-details-section">
                    <h2>جزئیات و آموزش</h2>
                    {selectedVaccine ? (
                        <div className="details-content">
                            <h3>{selectedVaccine.name}</h3>
                            <p><strong>موارد مصرف:</strong> {vaccineDetails[selectedVaccine.name]?.usage || 'اطلاعاتی ثبت نشده است.'}</p>
                            <p><strong>علائم احتمالی پس از تزریق:</strong> {vaccineDetails[selectedVaccine.name]?.symptoms || 'اطلاعاتی ثبت نشده است.'}</p>
                            <p><strong>مراقبت‌های پس از واکسن:</strong> {vaccineDetails[selectedVaccine.name]?.care || 'اطلاعاتی ثبت نشده است.'}</p>
                        </div>
                    ) : (
                        <p className="placeholder-text">برای مشاهده جزئیات، یک واکسن را از جدول بالا انتخاب کنید.</p>
                    )}
                </section>

                {/* Reminder Section */}
                <section className="reminder-section">
                    <h2>تنظیمات یادآور</h2>
                    <div className="reminder-controls">
                        <div className="reminder-toggle">
                            <label htmlFor="reminder-switch">فعال‌سازی یادآور</label>
                            <label className="switch">
                                <input type="checkbox" id="reminder-switch" checked={reminder.active} onChange={e => setReminder({...reminder, active: e.target.checked})} />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        {reminder.active && (
                            <div className="reminder-days">
                                <label htmlFor="days-before">تعداد روز قبل از موعد:</label>
                                <input
                                    type="number"
                                    id="days-before"
                                    value={reminder.daysBefore}
                                    onChange={e => setReminder({...reminder, daysBefore: parseInt(e.target.value) || 1})}
                                    min="1"
                                    max="30"
                                />
                            </div>
                        )}
                    </div>
                     <button className="btn-save-reminder" disabled={!reminder.active}>ذخیره تنظیمات یادآور</button>
                </section>
            </div>
        </div>
    );
};

export default VaccinationPage;
