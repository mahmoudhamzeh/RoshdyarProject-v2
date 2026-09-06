import React, { useState } from 'react';
import { getAuthToken, getLoggedInUser } from '../../api';

const CommentItem = ({ comment, onReply, depth = 0 }) => (
    <article className={`magazine-comment ${comment.isStaff ? 'is-staff' : ''}`}>
        <header>
            <strong>{comment.authorName}</strong>
            {comment.badge && <span className="magazine-comment-badge">{comment.badge}</span>}
            {comment.createdAt && <time>{new Date(comment.createdAt).toLocaleDateString('fa-IR')}</time>}
        </header>
        <p>{comment.body}</p>
        {depth < 3 && (
            <button type="button" className="magazine-comment-reply" onClick={() => onReply(comment)}>
                پاسخ
            </button>
        )}
        {comment.replies && comment.replies.length > 0 && (
            <div className="magazine-comment-replies">
                {comment.replies.map((child) => (
                    <CommentItem key={child.id} comment={child} onReply={onReply} depth={depth + 1} />
                ))}
            </div>
        )}
    </article>
);

const CommentThread = ({ postId, comments = [], onSubmitted }) => {
    const user = getAuthToken() ? getLoggedInUser() : null;
    const [form, setForm] = useState({ body: '', authorName: '', authorEmail: '', authorPhone: '' });
    const [parent, setParent] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        const res = await fetch(`/api/magazine/posts/${postId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...form,
                parentId: parent ? parent.id : undefined
            })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            setError(data.message || 'ارسال دیدگاه ناموفق بود');
            return;
        }
        setForm({ body: '', authorName: '', authorEmail: '', authorPhone: '' });
        setParent(null);
        setMessage(data.status === 'approved' ? 'دیدگاه شما ثبت شد.' : 'دیدگاه شما پس از تأیید مدیر نمایش داده می‌شود.');
        if (onSubmitted) onSubmitted();
    };

    return (
        <section className="magazine-comments" id="comments">
            <h2>دیدگاه‌ها</h2>
            {comments.length === 0 && <p className="magazine-muted">هنوز دیدگاهی تأیید نشده است.</p>}
            {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} onReply={setParent} />
            ))}
            <form className="magazine-comment-form" onSubmit={submit}>
                <h3>{parent ? `پاسخ به ${parent.authorName}` : 'ارسال دیدگاه'}</h3>
                {parent && (
                    <button type="button" className="magazine-comment-cancel" onClick={() => setParent(null)}>لغو پاسخ</button>
                )}
                {!user && (
                    <>
                        <input
                            required
                            placeholder="نام و نام خانوادگی"
                            value={form.authorName}
                            onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                        />
                        <input
                            type="email"
                            placeholder="ایمیل"
                            value={form.authorEmail}
                            onChange={(e) => setForm({ ...form, authorEmail: e.target.value })}
                        />
                        <input
                            placeholder="شماره تماس"
                            value={form.authorPhone}
                            onChange={(e) => setForm({ ...form, authorPhone: e.target.value })}
                        />
                    </>
                )}
                <textarea
                    required
                    rows="4"
                    placeholder="متن دیدگاه"
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                />
                {error && <p className="error-message">{error}</p>}
                {message && <p className="magazine-success">{message}</p>}
                <button type="submit">ارسال دیدگاه</button>
            </form>
        </section>
    );
};

export default CommentThread;
