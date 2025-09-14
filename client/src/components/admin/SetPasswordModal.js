import React, { useState } from 'react';
import './SetPasswordModal.css';

const SetPasswordModal = ({ user, onClose, onSave }) => {
    const [newPassword, setNewPassword] = useState('');

    if (!user) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newPassword.length < 4) {
            alert('رمز عبور باید حداقل ۴ کاراکتر باشد.');
            return;
        }
        onSave(user.id, newPassword);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <form onSubmit={handleSubmit}>
                    <h2>تنظیم رمز عبور جدید برای {user.username}</h2>
                    <div className="form-group">
                        <label htmlFor="newPassword">رمز عبور جدید</label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="رمز عبور جدید را وارد کنید"
                            required
                            minLength="4"
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="btn-save">ذخیره رمز</button>
                        <button type="button" onClick={onClose} className="btn-cancel">انصراف</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SetPasswordModal;
