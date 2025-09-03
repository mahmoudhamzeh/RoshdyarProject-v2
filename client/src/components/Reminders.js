import React, { useState, useEffect, useCallback, useRef } from 'react'; // Import useRef
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faTimes, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import AddReminderModal from './AddReminderModal';
import './Reminders.css';

const Reminders = () => {
    const [reminders, setReminders] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeChildId, setActiveChildId] = useState(null);
    const dropdownRef = useRef(null); // Create a ref for the dropdown

    const fetchReminders = useCallback(async (childId) => {
        if (!childId) return;
        try {
            const res = await fetch(`http://localhost:5000/api/reminders/all/${childId}`);
            if (res.ok) {
                const data = await res.json();
                const seen = getSeenReminders();
                const freshReminders = data.filter(r => !seen.includes(r.id));
                setReminders(freshReminders);
            } else {
                setReminders([]);
            }
        } catch (error) {
            console.error("Failed to fetch reminders", error);
            setReminders([]);
        }
    }, []); // getSeenReminders is stable, no need to add to deps

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

    // Effect for handling clicks outside the dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        // Add event listener when the dropdown is open
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Clean up the event listener
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]); // Only re-run if isOpen changes

    const getSeenReminders = () => {
        return JSON.parse(localStorage.getItem('seenReminders') || '[]');
    };

    const addSeenReminder = (reminderId) => {
        const seen = getSeenReminders();
        if (!seen.includes(reminderId)) {
            localStorage.setItem('seenReminders', JSON.stringify([...seen, reminderId]));
        }
    };

    const handleDismiss = async (reminder) => {
        // For manual reminders, delete from server
        if (reminder.source === 'manual' && activeChildId) {
            try {
                const response = await fetch(`http://localhost:5000/api/reminders/manual/${activeChildId}/${reminder.id}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    alert('خطا در حذف یادآور از سرور.');
                    return; // Stop if server deletion fails
                }
            } catch (error) {
                alert('خطا در ارتباط با سرور برای حذف یادآور.');
                return;
            }
        }

        // For all reminders (manual or automatic), add to seen list and update UI
        addSeenReminder(reminder.id);
        setReminders(prevReminders => prevReminders.filter(r => r.id !== reminder.id));
    };

    const handleReminderAdded = () => {
        fetchReminders(activeChildId);
    };

    return (
        <div className="reminders-widget" ref={dropdownRef}>
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
                            {reminders.map(r => {
                                const reminderContent = (
                                    <li key={r.id} className={`reminder-item type-${r.type}`}>
                                        <div className="reminder-content">
                                            <strong>{r.title}</strong>
                                            <p>{r.message}</p>
                                        </div>
                                        {r.source === 'manual' && (
                                            <button className="dismiss-btn" onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleDismiss(r);
                                            }}>
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        )}
                                    </li>
                                );

                                if (r.link) {
                                    return (
                                        <Link to={r.link} key={r.id} className="reminder-link" onClick={() => handleDismiss(r)}>
                                            {reminderContent}
                                        </Link>
                                    );
                                }
                                return reminderContent;
                            })}
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
