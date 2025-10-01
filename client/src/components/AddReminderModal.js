import React, { useState } from 'react';
import Modal from 'react-modal';
import DatePicker from 'react-modern-calendar-datepicker';
import 'react-modern-calendar-datepicker/lib/DatePicker.css';
import { fromShamsi, getCurrentShamsiDate } from '../utils/dateConverter';
import './AddReminderModal.css';

const AddReminderModal = ({ isOpen, onRequestClose, childId, onReminderAdded }) => {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(getCurrentShamsiDate());
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !date) {
            setError('لطفاً عنوان و تاریخ را مشخص کنید.');
            return;
        }
        setError('');

        try {
            const gregorianDate = fromShamsi(date);
            const res = await fetch(`http://localhost:5000/api/reminders/manual/${childId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, date: gregorianDate }),
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
                        value={date}
                        onChange={setDate}
                        shouldHighlightWeekends
                        locale="fa"
                        calendarClassName="responsive-calendar"
                        renderInput={({ ref }) => (
                            <input
                                readOnly
                                ref={ref}
                                value={date ? `${date.year}/${date.month}/${date.day}` : ''}
                                // The input will be styled by the parent .form-group selector
                            />
                        )}
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
