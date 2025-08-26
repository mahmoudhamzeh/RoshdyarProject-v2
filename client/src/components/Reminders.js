import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faTimes, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import AddReminderModal from './AddReminderModal'; // Import the modal
import './Reminders.css';

const Reminders = () => {
    const [reminders, setReminders] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // State for the modal
    const [activeChildId, setActiveChildId] = useState(null);

    const fetchReminders = useCallback(async (childId) => {
        if (!childId) return;
        try {
            const res = await fetch(`http://localhost:5000/api/reminders/all/${childId}`);
            if (res.ok) {
                const data = await res.json();
                setReminders(data);
            } else {
                setReminders([]);
            }
        } catch (error) {
            console.error("Failed to fetch reminders", error);
            setReminders([]);
        }
    }, []);

    const fetchAndSetChild = useCallback(async () => {
        try {
            const childrenRes = await fetch(`http://localhost:5000/api/children`);
            const childrenData = await childrenRes.json();
            if (childrenData && childrenData.length > 0) {
                const firstChildId = childrenData[0].id;
                setActiveChildId(firstChildId);
                fetchReminders(firstChildId);
            }
        } catch (error) {
            console.error("Failed to fetch children", error);
        }
    }, [fetchReminders]);

    useEffect(() => {
        fetchAndSetChild();
        const interval = setInterval(fetchAndSetChild, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, [fetchAndSetChild]);

    const handleDismiss = async (reminder) => {
        if (!activeChildId || reminder.source !== 'manual') return; // Only dismiss manual reminders
        try {
            await fetch(`http://localhost:5000/api/reminders/manual/${activeChildId}/${reminder.id}`, {
                method: 'DELETE',
            });
            fetchReminders(activeChildId); // Refresh list
        } catch (error) {
            console.error("Failed to dismiss reminder", error);
        }
    };

    const handleReminderAdded = () => {
        fetchReminders(activeChildId);
    };

    return (
        <div className="reminders-widget">
            <button className="reminders-bell" onClick={() => setIsOpen(!isOpen)}>
                <FontAwesomeIcon icon={faBell} />
                {reminders.length > 0 && <span className="reminder-count">{reminders.length}</span>}
            </button>
            {isOpen && (
                <div className="reminders-dropdown">
                    <div className="reminders-header">
                        <h4>یادآورها</h4>
                        <button className="add-reminder-btn" title="افزودن یادآور جدید" onClick={() => setIsModalOpen(true)}>
                            <FontAwesomeIcon icon={faPlusCircle} />
                        </button>
                    </div>
                    {reminders.length === 0 ? (
                        <p className="no-reminders">هیچ یادآور جدیدی وجود ندارد.</p>
                    ) : (
                        <ul className="reminders-list">
                            {reminders.map(r => (
                                <li key={r.id} className={`reminder-item type-${r.type}`}>
                                    <div className="reminder-content">
                                        <strong>{r.title}</strong>
                                        <p>{r.message}</p>
                                    </div>
                                    {r.source === 'manual' && (
                                        <button className="dismiss-btn" onClick={() => handleDismiss(r)}>
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
            {activeChildId && (
                <AddReminderModal
                    isOpen={isModalOpen}
                    onRequestClose={() => setIsModalOpen(false)}
                    childId={activeChildId}
                    onReminderAdded={handleReminderAdded}
                />
            )}
        </div>
    );
};

export default Reminders;
