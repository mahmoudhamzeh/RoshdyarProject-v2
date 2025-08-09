import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faTimes } from '@fortawesome/free-solid-svg-icons';
import './Reminders.css';

const Reminders = () => {
    const [reminders, setReminders] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    // Assume userId is stored in localStorage after login
    const getUserId = () => {
        const user = localStorage.getItem('loggedInUser');
        return user ? JSON.parse(user).id : null;
    };

    const userId = getUserId();

    const fetchReminders = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await fetch(`http://localhost:5000/api/reminders/${userId}`);
            const data = await res.json();
            setReminders(data);
        } catch (error) {
            console.error("Failed to fetch reminders", error);
        }
    }, [userId]);

    useEffect(() => {
        fetchReminders();
    }, [fetchReminders]);

    const handleDismiss = async (reminderId) => {
        if (!userId) return;
        try {
            await fetch(`http://localhost:5000/api/reminders/${userId}/${reminderId}`, {
                method: 'DELETE',
            });
            fetchReminders(); // Refresh list
        } catch (error) {
            console.error("Failed to dismiss reminder", error);
        }
    };

    return (
        <div className="reminders-widget">
            <button className="reminders-bell" onClick={() => setIsOpen(!isOpen)}>
                <FontAwesomeIcon icon={faBell} />
                {reminders.length > 0 && <span className="reminder-count">{reminders.length}</span>}
            </button>
            {isOpen && (
                <div className="reminders-dropdown">
                    {reminders.length === 0 ? (
                        <p className="no-reminders">هیچ یادآور جدیدی وجود ندارد.</p>
                    ) : (
                        <ul>
                            {reminders.map(r => (
                                <li key={r.id}>
                                    <span>{r.message}</span>
                                    <button className="dismiss-btn" onClick={() => handleDismiss(r.id)}>
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default Reminders;
