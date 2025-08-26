import React, { useState, useEffect } from 'react';
import './EditUserModal.css';

const EditUserModal = ({ user, onClose, onSave }) => {
    const [userData, setUserData] = useState(user);

    useEffect(() => {
        setUserData(user);
    }, [user]);

    if (!user) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(userData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmit}>
                    <h2>ویرایش کاربر: {user.username}</h2>
                    <div className="form-group">
                        <label>نام کاربری</label>
                        <input type="text" name="username" value={userData.username || ''} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>ایمیل</label>
                        <input type="email" name="email" value={userData.email || ''} onChange={handleChange} />
                    </div>
                    <div className="form-group-checkbox">
                        <label>
                            <input type="checkbox" name="isAdmin" checked={userData.isAdmin || false} onChange={handleChange} />
                            ادمین است
                        </label>
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="btn-save">ذخیره تغییرات</button>
                        <button type="button" onClick={onClose} className="btn-cancel">انصراف</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;
