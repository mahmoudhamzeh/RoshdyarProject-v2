import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import DatePicker from "react-datepicker";
import { format, parseISO } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
import './AddChildPage.css';

const EditChildPage = () => {
    const history = useHistory();
    const { id } = useParams();
    const [formData, setFormData] = useState(null);
    const [birthDate, setBirthDate] = useState(new Date());
    const [avatarFile, setAvatarFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchChildData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/children/${id}`);
                if (!response.ok) throw new Error('Child not found');
                const data = await response.json();
                const nameParts = data.name.split(' ') || [];
                data.firstName = nameParts[0] || '';
                data.lastName = nameParts.slice(1).join(' ') || '';
                setFormData(data);
                if (data.birthDate) setBirthDate(parseISO(data.birthDate.replace(/\//g, '-')));
                if (data.avatar) setPreview(data.avatar.startsWith('/uploads') ? `http://localhost:5000${data.avatar}` : data.avatar);
            } catch (error) { history.push('/my-children'); }
        };
        fetchChildData();
    }, [id, history]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "avatar" && files && files[0]) {
            setAvatarFile(files[0]);
            setPreview(URL.createObjectURL(files[0]));
        } else {
            setFormData(prevState => ({ ...prevState, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        let avatarPath = formData.avatar;

        if (avatarFile) {
            const uploadData = new FormData();
            uploadData.append('avatar', avatarFile);
            try {
                const uploadRes = await fetch('http://localhost:5000/api/upload', { method: 'POST', body: uploadData });
                if (!uploadRes.ok) throw new Error('Failed to upload new image');
                const result = await uploadRes.json();
                avatarPath = result.filePath;
            } catch (error) { alert(error.message); setIsSubmitting(false); return; }
        }

        try {
            const finalData = { ...formData, name: `${formData.firstName} ${formData.lastName}`.trim(), birthDate: format(birthDate, 'yyyy/MM/dd'), avatar: avatarPath };
            delete finalData.firstName;
            delete finalData.lastName;

            const response = await fetch(`http://localhost:5000/api/children/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(finalData) });
            if (!response.ok) throw new Error('Failed to update child info');
            alert('تغییرات با موفقیت ذخیره شد!');
            history.push('/my-children');
        } catch (error) { alert(error.message); }
        finally { setIsSubmitting(false); }
    };

    if (!formData) return <p>در حال بارگذاری...</p>;

    return (
        <div className="add-child-page-v2">
            <nav className="page-nav-final"><button onClick={() => history.push('/my-children')} className="back-btn-add-child">&rarr;</button><h1>ویرایش اطلاعات {formData.firstName}</h1><div className="nav-placeholder"></div></nav>
            <div className="add-child-form-container-v2">
                <form onSubmit={handleSubmit} className="add-child-form">
                    <div className="form-group-full avatar-upload-area"><label>عکس پروفایل</label><img src={preview} alt="Preview" className="avatar-preview" /><input type="file" name="avatar" onChange={handleChange} accept="image/*" capture="user" /></div>
                    <div className="form-row"><div className="form-group"><label>نام</label><input name="firstName" value={formData.firstName} onChange={handleChange} required /></div><div className="form-group"><label>نام خانوادگی</label><input name="lastName" value={formData.lastName} onChange={handleChange} required /></div></div>
                    <div className="form-row">
                        <div className="form-group"><label>جنسیت</label><select name="gender" value={formData.gender} onChange={handleChange}><option value="boy">پسر</option><option value="girl">دختر</option></select></div>
                        <div className="form-group"><label>تاریخ تولد</label><DatePicker selected={birthDate} onChange={(date) => setBirthDate(date)} dateFormat="yyyy/MM/dd" showYearDropdown scrollableYearDropdown yearDropdownItemNumber={40}/></div>
                    </div>
                    <div className="form-row"><div className="form-group"><label>قد (سانتی‌متر)</label><input type="number" name="height" value={formData.height} onChange={handleChange} /></div><div className="form-group"><label>وزن (کیلوگرم)</label><input type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange} /></div></div>
                    <div className="form-row"><div className="form-group"><label>گروه خونی</label><select name="bloodType" value={formData.bloodType} onChange={handleChange}><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>O+</option><option>O-</option></select></div><div className="form-group"></div></div>
                    <div className="form-group-full"><label>آلرژی‌ها</label><textarea name="allergies" value={formData.allergies || ''} rows="3" onChange={handleChange}></textarea></div>
                    <div className="form-group-full"><label>بیماری‌های خاص</label><textarea name="special_illnesses" value={formData.special_illnesses || ''} rows="3" onChange={handleChange}></textarea></div>
                    <div className="form-actions"><button type="submit" className="btn-save" disabled={isSubmitting}>{isSubmitting ? 'در حال ذخیره...' : 'ذخیره تغییرات'}</button><button type="button" onClick={() => history.push('/my-children')} className="btn-cancel">انصراف</button></div>
                </form>
            </div>
        </div>
    );
};

export default EditChildPage;