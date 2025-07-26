import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import DatePicker from "react-datepicker";
import { format } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
import './AddChildPage.css';

const AddChildPage = () => {
    const history = useHistory();
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', gender: 'boy', height: '', weight: '',
        bloodType: 'A+',
        allergies: {
            types: { 'غذایی': false, 'دارویی': false, 'محیطی': false, 'سایر': false },
            description: ''
        },
        special_illnesses: {
            types: { 'مزمن': false, 'ژنتیکی': false, 'تکاملی': false, 'سایر': false },
            description: ''
        }
    });
    const [birthDate, setBirthDate] = useState(new Date());
    const [avatarFile, setAvatarFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (name === "avatar" && files && files[0]) {
            setAvatarFile(files[0]);
            setPreview(URL.createObjectURL(files[0]));
        } else if (name.includes('.')) {
            const [category, field, subField] = name.split('.');
            if (type === 'checkbox') {
                setFormData(prevState => ({
                    ...prevState,
                    [category]: {
                        ...prevState[category],
                        [field]: { ...prevState[category][field], [subField]: checked }
                    }
                }));
            } else {
                setFormData(prevState => ({
                    ...prevState,
                    [category]: { ...prevState[category], [field]: value }
                }));
            }
        } else {
            setFormData(prevState => ({ ...prevState, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        let avatarPath = '';

        if (avatarFile) {
            const uploadData = new FormData();
            uploadData.append('avatar', avatarFile);
            try {
                const uploadRes = await fetch('http://localhost:5000/api/upload', { method: 'POST', body: uploadData });
                if (!uploadRes.ok) throw new Error('Failed to upload image');
                const result = await uploadRes.json();
                avatarPath = result.filePath.replace(/\\/g, "/");
            } catch (error) { alert(error.message); setIsSubmitting(false); return; }
        }

        try {
            const formattedBirthDate = format(birthDate, 'yyyy/MM/dd');
            const finalData = { ...formData, birthDate: formattedBirthDate, avatar: avatarPath };
            const response = await fetch('http://localhost:5000/api/children', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(finalData) });
            if (!response.ok) throw new Error('Failed to add child');
            alert('کودک با موفقیت اضافه شد!');
            history.push('/my-children');
        } catch (error) { alert(error.message); }
        finally { setIsSubmitting(false); }
    };

    return (
        <div className="add-child-page-v2">
            <nav className="page-nav-final"><button onClick={() => history.push('/my-children')} className="back-btn-add-child">&rarr;</button><h1>افزودن کودک جدید</h1><div className="nav-placeholder"></div></nav>
            <div className="add-child-form-container-v2">
                <form onSubmit={handleSubmit} className="add-child-form">
                    <div className="form-group-full avatar-upload-area"><label htmlFor="avatar">عکس پروفایل</label><img src={preview || 'https://i.pravatar.cc/150?u=default'} alt="پیش‌نمایش" className="avatar-preview" /><input type="file" id="avatar" name="avatar" onChange={handleChange} accept="image/*" capture="user" /></div>
                    <div className="form-row"><div className="form-group"><label>نام</label><input name="firstName" value={formData.firstName} onChange={handleChange} required /></div><div className="form-group"><label>نام خانوادگی</label><input name="lastName" value={formData.lastName} onChange={handleChange} required /></div></div>
                    <div className="form-row"><div className="form-group"><label>جنسیت</label><select name="gender" value={formData.gender} onChange={handleChange}><option value="boy">پسر</option><option value="girl">دختر</option></select></div><div className="form-group"><label>تاریخ تولد</label><DatePicker selected={birthDate} onChange={(date) => setBirthDate(date)} dateFormat="yyyy/MM/dd" showYearDropdown scrollableYearDropdown yearDropdownItemNumber={40} /></div></div>
                    <div className="form-row"><div className="form-group"><label>قد (سانتی‌متر)</label><input type="number" name="height" value={formData.height} onChange={handleChange} /></div><div className="form-group"><label>وزن (کیلوگرم)</label><input type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange} /></div></div>
                    <div className="form-row"><div className="form-group"><label>گروه خونی</label><select name="bloodType" value={formData.bloodType} onChange={handleChange}><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>O+</option><option>O-</option></select></div><div className="form-group"></div></div>
                    <div className="form-section">
                        <label className="section-title">آلرژی‌ها</label>
                        <div className="checkbox-container">
                            {Object.keys(formData.allergies.types).map(key => (
                                <div key={key} className="checkbox-item">
                                    <input type="checkbox" id={`allergy-${key}`} name={`allergies.types.${key}`} checked={formData.allergies.types[key]} onChange={handleChange} />
                                    <label htmlFor={`allergy-${key}`}>{key}</label>
                                </div>
                            ))}
                        </div>
                        {Object.values(formData.allergies.types).some(v => v) && (
                            <textarea name="allergies.description" value={formData.allergies.description} rows="3" placeholder="توضیحات بیشتر در مورد آلرژی‌ها" onChange={handleChange}></textarea>
                        )}
                    </div>
                    <div className="form-section">
                        <label className="section-title">بیماری‌های خاص</label>
                        <div className="checkbox-container">
                            {Object.keys(formData.special_illnesses.types).map(key => (
                                <div key={key} className="checkbox-item">
                                    <input type="checkbox" id={`illness-${key}`} name={`special_illnesses.types.${key}`} checked={formData.special_illnesses.types[key]} onChange={handleChange} />
                                    <label htmlFor={`illness-${key}`}>{key}</label>
                                </div>
                            ))}
                        </div>
                        {Object.values(formData.special_illnesses.types).some(v => v) && (
                            <textarea name="special_illnesses.description" value={formData.special_illnesses.description} rows="3" placeholder="توضیحات بیشتر در مورد بیماری‌ها" onChange={handleChange}></textarea>
                        )}
                    </div>
                    <div className="form-actions"><button type="submit" className="btn-save" disabled={isSubmitting}>{isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}</button><button type="button" onClick={() => history.push('/my-children')} className="btn-cancel">انصراف</button></div>
                </form>
            </div>
        </div>
    );
};

export default AddChildPage;