import React, { useCallback, useEffect, useRef } from 'react';

const exec = (command, value) => {
    document.execCommand(command, false, value);
};

const RichTextEditor = ({ value, onChange, onUpload }) => {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current) ref.current.innerHTML = value || '';
    }, [value]);

    const emit = useCallback(() => {
        if (!ref.current) return;
        if (onChange) onChange(ref.current.innerHTML);
    }, [onChange]);

    const insertImage = async () => {
        const url = window.prompt('نشانی تصویر را وارد کنید یا خالی بگذارید تا فایل آپلود شود');
        if (url) {
            exec('insertImage', url);
            emit();
            return;
        }
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,.webp,.avif';
        input.onchange = async () => {
            const file = input.files && input.files[0];
            if (!file || !onUpload) return;
            const uploaded = await onUpload(file);
            if (uploaded) {
                exec('insertImage', uploaded);
                emit();
            }
        };
        input.click();
    };

    return (
        <div className="magazine-editor">
            <div className="magazine-editor-toolbar">
                <button type="button" onClick={() => exec('formatBlock', 'H2')}>H2</button>
                <button type="button" onClick={() => exec('formatBlock', 'H3')}>H3</button>
                <button type="button" onClick={() => exec('formatBlock', 'H4')}>H4</button>
                <button type="button" onClick={() => exec('bold')}>بولد</button>
                <button type="button" onClick={() => exec('italic')}>ایتالیک</button>
                <button type="button" onClick={() => exec('formatBlock', 'BLOCKQUOTE')}>نقل‌قول</button>
                <button type="button" onClick={() => exec('insertUnorderedList')}>فهرست</button>
                <button type="button" onClick={() => exec('insertOrderedList')}>شماره</button>
                <button type="button" onClick={() => exec('createLink', window.prompt('لینک') || '')}>لینک</button>
                <button type="button" onClick={insertImage}>تصویر</button>
                <button
                    type="button"
                    onClick={() => {
                        exec('insertHTML', '<table><thead><tr><th>ستون ۱</th><th>ستون ۲</th></tr></thead><tbody><tr><td></td><td></td></tr></tbody></table>');
                        emit();
                    }}
                >
                    جدول
                </button>
            </div>
            <div
                ref={ref}
                className="magazine-editor-surface"
                contentEditable
                dir="rtl"
                onInput={emit}
            />
        </div>
    );
};

export default RichTextEditor;
