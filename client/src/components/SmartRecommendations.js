import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons';

const SmartRecommendations = ({ child, growthTrend, vaccinationStatus }) => {
    const recommendations = [];

    // Rule 1: Growth Trend
    if (growthTrend.height === 'declining' || growthTrend.weight === 'declining') {
        recommendations.push({
            id: 'growth-decline',
            text: 'روند رشد کودک شما در قد یا وزن رو به کاهش است. توصیه می‌شود برای بررسی بیشتر با پزشک مشورت کنید.',
            severity: 'high'
        });
    }

    // Rule 2: Allergies
    if (child.allergies && Object.values(child.allergies.types).some(v => v)) {
        recommendations.push({
            id: 'allergies',
            text: 'کودک شما دارای آلرژی ثبت شده است. برای اطلاعات بیشتر در مورد مدیریت آلرژی در کودکان، می‌توانید به منابع معتبر مراجعه کنید.',
            severity: 'medium'
        });
    }

    // Rule 3: Overdue Vaccines
    if (vaccinationStatus && vaccinationStatus.some(v => v.status === 'overdue')) {
        recommendations.push({
            id: 'overdue-vaccine',
            text: 'برخی از واکسن‌های کودک شما به تأخیر افتاده است. لطفاً برای تکمیل واکسیناسیون به پزشک یا مرکز بهداشت مراجعه کنید.',
            severity: 'high'
        });
    }

    if (recommendations.length === 0) {
        recommendations.push({
            id: 'all-good',
            text: 'همه چیز خوب به نظر می‌رسد! به مراقبت عالی خود از کودک ادامه دهید.',
            severity: 'low'
        });
    }

    const getSeverityClass = (severity) => {
        if (severity === 'high') return 'rec-high';
        if (severity === 'medium') return 'rec-medium';
        return 'rec-low';
    };

    return (
        <div className="recommendations-container">
            <ul>
                {recommendations.map(rec => (
                    <li key={rec.id} className={getSeverityClass(rec.severity)}>
                        <FontAwesomeIcon icon={faLightbulb} />
                        <p>{rec.text}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SmartRecommendations;
