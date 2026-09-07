import React, { useEffect, useRef, useState } from 'react';
import CategoryTree, { CategoryParentCascade } from './CategoryTree';
import './ProductManagement.css';

const CategoryManagement = () => {
    const [tree, setTree] = useState([]);
    const [name, setName] = useState('');
    const [parentId, setParentId] = useState('');
    const [error, setError] = useState('');
    const nameRef = useRef(null);

    const load = async () => {
        const res = await fetch('/api/admin/product-categories');
        if (!res.ok) throw new Error('بارگذاری گروه‌ها ناموفق بود');
        setTree(await res.json());
    };

    useEffect(() => {
        load().catch((err) => setError(err.message));
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        const res = await fetch('/api/admin/product-categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, parentId: parentId || null })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            setError(data.message || 'ثبت گروه ناموفق بود');
            return;
        }
        setName('');
        setParentId('');
        load().catch((err) => setError(err.message));
    };

    const handleDelete = async (id) => {
        if (!window.confirm('این گروه و زیرگروه‌هایش حذف شود؟')) return;
        await fetch(`/api/admin/product-categories/${id}`, { method: 'DELETE' });
        load().catch((err) => setError(err.message));
    };

    const addChild = (id) => {
        setParentId(String(id));
        if (nameRef.current) nameRef.current.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="product-management">
            <h2>گروه و زیرگروه محصولات</h2>
            <p>
                ساختار درختی است: گروه اصلی در بالا، زیرگروه‌ها تو رفته و با خط به والد وصل می‌شوند.
                برای دیدن سطوح پایین‌تر، فلش کنار هر گروه را باز کنید.
            </p>
            <form className="product-form" onSubmit={handleCreate}>
                <h3>افزودن گروه</h3>
                <label htmlFor="category-name">نام گروه یا زیرگروه</label>
                <input
                    id="category-name"
                    ref={nameRef}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثلاً اسباب‌بازی یا ماشین"
                    required
                />
                <CategoryParentCascade tree={tree} value={parentId} onChange={setParentId} />
                <button type="submit">افزودن</button>
            </form>
            {error && <p className="error-message">{error}</p>}
            <CategoryTree tree={tree} onDelete={handleDelete} onAddChild={addChild} />
        </div>
    );
};

export default CategoryManagement;
