import React, { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Carousel from './Carousel';
import ServiceTiles from './ServiceTiles';
import ContentRow from './ContentRow';

const mockVideos = Array.from({ length: 8 }, (_, i) => ({
    id: i, title: `ویدیو آموزشی ${i + 1}`,
    image: `https://placehold.co/220x140/4CAF50/FFFFFF?text=Video+${i+1}`
}));

const mockArticles = Array.from({ length: 8 }, (_, i) => ({
    id: i, title: `مقاله شماره ${i + 1}`,
    image: `https://placehold.co/220x140/f44336/FFFFFF?text=Article+${i+1}`
}));

const DashboardPage = () => {
    const fileInputRef = useRef(null);
    const [stats, setStats] = useState({ totalChildren: 0, averageAge: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/stats');
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };
        fetchStats();
    }, []);

    const handleBackup = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/backup');
            const data = await response.json();
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'roshdyar_backup.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error backing up data:', error);
        }
    };

    const handleRestore = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                await fetch('http://localhost:5000/api/restore', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });
                alert('اطلاعات با موفقیت بازیابی شد');
                window.location.reload();
            } catch (error) {
                console.error('Error restoring data:', error);
                alert('خطا در بازیابی اطلاعات');
            }
        };
        reader.readAsText(file);
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    return (
        <div>
            <Navbar />
            <main>
                <Carousel />
                <ServiceTiles />

                <div className="stats-section">
                    <h3>آمار کلی</h3>
                    <p>تعداد کل کودکان: {stats.totalChildren}</p>
                    <p>میانگین سنی کودکان: {stats.averageAge} سال</p>
                </div>

                <div className="backup-restore-section">
                    <button onClick={handleBackup}>پشتیبان‌گیری</button>
                    <button onClick={triggerFileInput}>بازیابی</button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleRestore}
                        style={{ display: 'none' }}
                        accept=".json"
                    />
                </div>

                <ContentRow title="ویدیوهای آموزشی و تربیتی" items={mockVideos} />
                <ContentRow title="جدیدترین مقالات" items={mockArticles} />
            </main>
            <Footer />
        </div>
    );
};

export default DashboardPage;