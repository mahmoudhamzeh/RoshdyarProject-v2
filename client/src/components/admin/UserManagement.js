import React, { useState, useEffect } from 'react';
import './UserManagement.css';
import EditUserModal from './EditUserModal';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const adminUser = JSON.parse(localStorage.getItem('loggedInUser'));
            const response = await fetch('http://localhost:5000/api/admin/users', {
                headers: { 'x-user-id': adminUser.id }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    if (loading) return <p>در حال بارگذاری کاربران...</p>;
    if (error) return <p>خطا در دریافت کاربران: {error}</p>;

    const handleDelete = async (userId) => {
        if (window.confirm('آیا از حذف این کاربر اطمینان دارید؟')) {
            try {
                const adminUser = JSON.parse(localStorage.getItem('loggedInUser'));
                const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
                    method: 'DELETE',
                    headers: { 'x-user-id': adminUser.id }
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to delete user');
                }
                // Refresh user list
                setUsers(users.filter(user => user.id !== userId));
                alert('کاربر با موفقیت حذف شد');
            } catch (err) {
                setError(err.message);
                alert(`خطا در حذف کاربر: ${err.message}`);
            }
        }
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSaveUser = async (updatedUser) => {
        try {
            const adminUser = JSON.parse(localStorage.getItem('loggedInUser'));
            const response = await fetch(`http://localhost:5000/api/admin/users/${updatedUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': adminUser.id
                },
                body: JSON.stringify(updatedUser)
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update user');
            }
            setUsers(users.map(user => user.id === updatedUser.id ? data : user));
            handleCloseModal();
            alert('کاربر با موفقیت به‌روز شد');
        } catch (err) {
            setError(err.message);
            alert(`خطا در به‌روزرسانی کاربر: ${err.message}`);
        }
    };

    return (
        <div className="user-management">
            <h2>مدیریت کاربران</h2>
            {error && <p className="error-message">{error}</p>}
            <table className="users-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>نام کاربری</th>
                        <th>ایمیل</th>
                        <th>مدیر</th>
                        <th>عملیات</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.isAdmin ? 'بله' : 'خیر'}</td>
                            <td>
                                <button onClick={() => handleEditClick(user)} className="btn-edit">ویرایش</button>
                                <button onClick={() => handleDelete(user.id)} className="btn-delete">حذف</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {isModalOpen && (
                <EditUserModal
                    user={editingUser}
                    onClose={handleCloseModal}
                    onSave={handleSaveUser}
                />
            )}
        </div>
    );
};

export default UserManagement;
