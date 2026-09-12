import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import ChildAvatar from './ChildAvatar';
import { getChildDisplayName } from '../utils/childName';
import './MyChildrenPage.css';

const MyChildrenPage = () => {
    const history = useHistory();
    const [children, setChildren] = useState([]);

    const fetchChildren = useCallback(async () => {
        try {
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
            if (!loggedInUser) {
                history.push('/register');
                return;
            }

            const response = await fetch('/api/children', {
                headers: {
                    'x-user-id': loggedInUser.id
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch children data.');
            }

            const data = await response.json();
            setChildren(data);
        } catch (error) {
            console.error('Failed to fetch children:', error);
        }
    }, [history]);

    useEffect(() => {
        fetchChildren();
    }, [fetchChildren]);

    const handleDelete = async (childId) => {
        if (window.confirm('آیا از حذف این کودک مطمئن هستید؟')) {
            try {
                await fetch(`/api/children/${childId}`, { method: 'DELETE' });
                fetchChildren();
            } catch (error) { alert('خطا در حذف کودک'); }
        }
    };

    const ArrowRightIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>);

    const calculateAge = (birthDateStr) => {
        if (!birthDateStr) return 'نامشخص';
        const birthDate = new Date(birthDateStr.replace(/\//g, '-'));
        const today = new Date();
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
            years--;
            months += 12;
        }
        if (years === 0 && months === 0) return 'نوزاد';
        if (years === 0) return `${months} ماهه`;
        if (months === 0) return `${years} ساله`;
        return `${years} سال و ${months} ماه`;
    };

    return (
        <div className="children-page-final">
            <nav className="page-nav-final">
                <button type="button" onClick={() => history.push('/dashboard')} className="back-btn">
                    <ArrowRightIcon />
                    <span>صفحه اصلی</span>
                </button>
                <h1>کودکان من</h1>
                <div className="nav-placeholder" />
            </nav>
            <div className="children-content-final">
                <button type="button" onClick={() => history.push('/add-child')} className="add-child-btn-final">+ افزودن کودک جدید</button>
                <div className="children-list-final">
                    {children.length === 0 ? <p className="no-children-message">هنوز کودکی اضافه نشده است.</p> :
                     children.map((child) => (
                            <div key={child.id} className="child-card-final" data-id={child.id}>
                                <ChildAvatar child={child} size={64} className="child-avatar-final" />
                                <div className="child-info-final">
                                    <h3>{getChildDisplayName(child)}</h3>
                                    <p>سن: {calculateAge(child.birthDate)}</p>
                                </div>
                                <div className="child-card-actions">
                                    <button type="button" onClick={() => history.push(`/health-profile/${child.id}`)} className="view-profile-btn-final">مشاهده پرونده</button>
                                    <button type="button" onClick={() => history.push(`/edit-child/${child.id}`)} className="edit-btn-final">ویرایش</button>
                                    <button type="button" onClick={() => handleDelete(child.id)} className="delete-btn-final">حذف</button>
                                </div>
                            </div>
                     ))}
                </div>
            </div>
        </div>
    );
};

export default MyChildrenPage;
