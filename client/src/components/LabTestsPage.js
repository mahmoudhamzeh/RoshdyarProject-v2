import React, { useState, useEffect, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVial, faPlus } from '@fortawesome/free-solid-svg-icons';
import { getTestStatus } from '../utils/lab-test-ranges';
import './LabTestsPage.css';

Modal.setAppElement('#root');

const recommendedCheckupsData = {
    '0-6': ['معاینه فیزیکی کامل در ۱، ۲، ۴ و ۶ ماهگی', 'بررسی شنوایی و بینایی'],
    '6-12': ['آزمایش کم‌خونی (CBC) در ۹-۱۲ ماهگی', 'بررسی روند رشد و تغذیه تکمیلی'],
    '12-24': ['چکاپ سالانه در ۱۸ و ۲۴ ماهگی', 'آزمایش ویتامین D'],
    '24-60': ['چکاپ سالانه', 'ارزیابی بینایی و شنوایی دوره‌ای'],
};

const RecommendedCheckups = ({ ageInMonths }) => {
    let ageGroup = '24-60';
    if (ageInMonths <= 6) ageGroup = '0-6';
    else if (ageInMonths <= 12) ageGroup = '6-12';
    else if (ageInMonths <= 24) ageGroup = '12-24';

    const recommendations = recommendedCheckupsData[ageGroup];

    return (
        <div className="recommended-checkups">
            <h4>چکاپ‌های پیشنهادی برای این گروه سنی</h4>
            <ul>
                {recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
            </ul>
        </div>
    );
};

const LabTestsPage = () => {
    const history = useHistory();
    const { childId } = useParams();
    const [child, setChild] = useState(null);
    const [tests, setTests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTest, setNewTest] = useState({
        testType: '',
        date: new Date(),
        numericResult: '',
        doctorNote: '',
        resultFile: null,
    });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [testsRes, childRes] = await Promise.all([
                fetch(`http://localhost:5000/api/lab-tests/${childId}`),
                fetch(`http://localhost:5000/api/children/${childId}`)
            ]);
            const testsData = await testsRes.json();
            const childData = await childRes.json();
            setTests(testsData);
            setChild(childData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setIsLoading(false);
        }
    }, [childId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTest(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setNewTest(prev => ({ ...prev, resultFile: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('testType', newTest.testType);
        formData.append('date', newTest.date.toISOString().split('T')[0]);
        formData.append('numericResult', newTest.numericResult);
        formData.append('doctorNote', newTest.doctorNote);
        if (newTest.resultFile) {
            formData.append('resultFile', newTest.resultFile);
        }

        try {
            const res = await fetch(`http://localhost:5000/api/lab-tests/${childId}`, {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) throw new Error('Failed to save test result');

            fetchData(); // Refresh list
            setIsModalOpen(false); // Close modal
            setNewTest({ testType: '', date: new Date(), numericResult: '', doctorNote: '', resultFile: null }); // Reset form
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="lab-tests-page">
            <nav className="page-nav-final">
                <button onClick={() => history.goBack()} className="back-btn">
                    &larr; بازگشت به پرونده
                </button>
                <h1><FontAwesomeIcon icon={faVial} /> چکاپ و آزمایش‌ها</h1>
                <button className="add-test-btn" onClick={() => setIsModalOpen(true)}>
                    <FontAwesomeIcon icon={faPlus} /> افزودن آزمایش
                </button>
            </nav>

            <main>
                {child && <RecommendedCheckups ageInMonths={(new Date() - new Date(child.birthDate)) / (1000 * 60 * 60 * 24 * 30.4375)} />}
                <div className="tests-list-container">
                    {isLoading ? (
                        <p>در حال بارگذاری...</p>
                    ) : tests.length === 0 ? (
                    <div className="no-tests-message">
                        <p>هیچ آزمایشی ثبت نشده است.</p>
                        <p>برای افزودن اولین آزمایش، روی دکمه "افزودن آزمایش" کلیک کنید.</p>
                    </div>
                ) : (
                    <ul className="tests-list">
                        {tests.map(test => {
                            const ageInMonths = child ? (new Date(test.date) - new Date(child.birthDate)) / (1000 * 60 * 60 * 24 * 30.4375) : 0;
                            const status = getTestStatus(test.testType, ageInMonths, test.numericResult);
                            return (
                                <li key={test.id} className="test-item">
                                    <div className="test-item-header">
                                        <span className="test-type">{test.testType}</span>
                                        <span className="test-date">{new Date(test.date).toLocaleDateString('fa-IR')}</span>
                                    </div>
                                    <div className="test-item-body">
                                        {test.numericResult && (
                                            <p>
                                                <strong>نتیجه:</strong> {test.numericResult}
                                                <span className={`status-badge ${status.className}`}>{status.status}</span>
                                            </p>
                                        )}
                                        {test.doctorNote && <p><strong>یادداشت پزشک:</strong> {test.doctorNote}</p>}
                                        {test.fileUrl && <a href={`http://localhost:5000${test.fileUrl}`} target="_blank" rel="noopener noreferrer">مشاهده فایل</a>}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
                </div>
            </main>

            <Modal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} className="add-data-modal" overlayClassName="modal-overlay">
                <h2>افزودن آزمایش جدید</h2>
                <form onSubmit={handleSubmit} className="add-data-form">
                    <input type="text" name="testType" value={newTest.testType} onChange={handleInputChange} placeholder="نوع آزمایش (مثلاً CBC)" required />
                    <DatePicker selected={newTest.date} onChange={date => setNewTest(prev => ({ ...prev, date }))} dateFormat="yyyy/MM/dd" />
                    <input type="text" name="numericResult" value={newTest.numericResult} onChange={handleInputChange} placeholder="نتیجه عددی (اختیاری)" />
                    <textarea name="doctorNote" value={newTest.doctorNote} onChange={handleInputChange} placeholder="توصیه پزشک (اختیاری)"></textarea>
                    <label>فایل نتیجه (اختیاری)</label>
                    <input type="file" name="resultFile" onChange={handleFileChange} />
                    <div className="modal-actions">
                        <button type="submit">ذخیره</button>
                        <button type="button" onClick={() => setIsModalOpen(false)}>انصراف</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default LabTestsPage;
