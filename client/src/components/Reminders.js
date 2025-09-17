import React, { useState, useEffect, useCallback, useRef } from 'react'; // Import useRef
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faTimes, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import AddReminderModal from './AddReminderModal';
import './Reminders.css';

const Reminders = () => {
    const [reminders, setReminders] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeChildId, setActiveChildId] = useState(null);
    const widgetRef = useRef(null);
    const bellRef = useRef(null);
    const dropdownMenuRef = useRef(null);
    const location = useLocation();

    // This effect handles the dynamic positioning of the dropdown on desktop
    useEffect(() => {
        if (isOpen && bellRef.current && dropdownMenuRef.current) {
            // We only apply JS positioning for screens wider than 1024px
            if (window.innerWidth > 1024) {
                const bellRect = bellRef.current.getBoundingClientRect();
                const menuNode = dropdownMenuRef.current;

                // Position dropdown vertically below the bell icon
                menuNode.style.top = `${bellRect.bottom + 10}px`;

                // Position dropdown horizontally. Align its right edge with the bell's right edge.
                const menuWidth = 350; // As defined in CSS
                menuNode.style.left = `${bellRect.right - menuWidth}px`;

                // Ensure it doesn't go off the left side of the screen
                if ((bellRect.right - menuWidth) < 10) {
                    menuNode.style.left = '10px';
                }

                // We need to use fixed position to escape the navbar's overflow context
                menuNode.style.position = 'fixed';
            } else {
                // On mobile, reset styles to let CSS handle the centered modal
                const menuNode = dropdownMenuRef.current;
                menuNode.style.position = '';
                menuNode.style.top = '';
                menuNode.style.left = '';
            }
        }
    }, [isOpen]);

    const fetchReminders = useCallback(async (childId) => {
        if (!childId) {
            setReminders([]);
            return;
        };
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

    // Effect to determine the active child and fetch reminders
    useEffect(() => {
        const pathParts = location.pathname.split('/');
        // Check for URLs like /health-profile/:childId, /growth-chart/:childId etc.
        const childIdFromUrl = pathParts.length > 2 && !isNaN(pathParts[2]) ? parseInt(pathParts[2], 10) : null;

        const determineChildAndFetch = async () => {
            if (childIdFromUrl) {
                setActiveChildId(childIdFromUrl);
                fetchReminders(childIdFromUrl);
            } else {
                // Fallback to first child if on a general page
                try {
                    const childrenRes = await fetch(`http://localhost:5000/api/children`);
                    const childrenData = await childrenRes.json();
                    if (childrenData && childrenData.length > 0) {
                        const firstChildId = childrenData[0].id;
                        setActiveChildId(firstChildId);
                        fetchReminders(firstChildId);
                    } else {
                        setActiveChildId(null);
                        fetchReminders(null);
                    }
                } catch (error) {
                    console.error("Failed to fetch children", error);
                }
            }
        };

        determineChildAndFetch();
        // Re-run this effect whenever the URL changes
    }, [location, fetchReminders]);

    // Effect for handling clicks outside the dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (widgetRef.current && !widgetRef.current.contains(event.target)) {
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
        <div className="reminders-widget" ref={widgetRef}>
            <button className="reminders-bell" onClick={() => setIsOpen(!isOpen)} ref={bellRef}>
                <FontAwesomeIcon icon={faBell} />
                {reminders.length > 0 && <span className="reminder-count">{reminders.length}</span>}
            </button>
            {isOpen && (
                <div className="reminders-dropdown" ref={dropdownMenuRef}>
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
