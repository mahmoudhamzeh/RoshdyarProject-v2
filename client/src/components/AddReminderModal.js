import React, { useState } from 'react';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './AddReminderModal.css';

const AddReminderModal = ({ isOpen, onRequestClose, childId, onReminderAdded }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date());
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !date) {
            setError('لطفاً عنوان و تاریخ را مشخص کنید.');
            return;
        }
        setError('');

        try {
            const res = await fetch(`http://localhost:5000/api/reminders/manual/${childId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, date: date.toISOString().split('T')[0] }),
            });

            if (res.ok) {
                onReminderAdded(); // Callback to refresh the list
                onRequestClose(); // Close the modal
            } else {
                setError('خطا در ثبت یادآور. لطفاً دوباره تلاش کنید.');
            }
        } catch (err) {
            setError('خطای ارتباط با سرور.');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            className="add-reminder-modal"
            overlayClassName="modal-overlay"
        >
            <h2>افزودن یادآور جدید</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="reminder-title">عنوان</label>
                    <input
                        id="reminder-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="مثلاً: مراجعه به دندانپزشک"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="reminder-date">تاریخ</label>
                    <DatePicker
                        id="reminder-date"
                        selected={date}
                        onChange={(d) => setDate(d)}
                        dateFormat="yyyy/MM/dd"
                        className="date-picker-full-width"
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                <div className="modal-actions">
                    <button type="submit" className="btn-submit">ثبت یادآور</button>
                    <button type="button" className="btn-cancel" onClick={onRequestClose}>انصراف</button>
                </div>
            </form>
        </Modal>
    );
};

export default AddReminderModal;
