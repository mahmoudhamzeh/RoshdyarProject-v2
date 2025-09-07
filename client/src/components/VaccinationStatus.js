import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faClock } from '@fortawesome/free-solid-svg-icons';
import './VaccinationStatus.css';

const VaccinationStatus = () => {
    const { childId } = useParams();
    const [vaccinationStatus, setVaccinationStatus] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchStatus = useCallback(async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/vaccination-status/${childId}`);
            const data = await res.json();
            setVaccinationStatus(data);
        } catch (error) {
            console.error("Failed to fetch vaccination status", error);
        } finally {
            setIsLoading(false);
        }
    }, [childId]);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    const handleMarkAsDone = async (vaccineName, dose) => {
        try {
            await fetch(`http://localhost:5000/api/vaccinate/${childId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vaccineName, dose }),
            });
            fetchStatus(); // Refresh the status
        } catch (error) {
            console.error("Failed to mark vaccine as done", error);
        }
    };

    const renderVaccineList = (vaccines, title, icon) => (
        <div className="vaccine-category">
            <h4><FontAwesomeIcon icon={icon} /> {title}</h4>
            {vaccines.length > 0 ? (
                <ul>
                    {vaccines.map(v => (
                        <li key={`${v.name}-${v.dose}`}>
                            <span>{v.name} (Dose {v.dose}) - due at {v.month} months</span>
                            {v.status !== 'done' && <button onClick={() => handleMarkAsDone(v.name, v.dose)}>Mark as Done</button>}
                            {v.status === 'done' && <span className="done-date">Done on: {new Date(v.administeredDate).toLocaleDateString('fa-IR')}</span>}
                        </li>
                    ))}
                </ul>
            ) : <p>هیچ موردی یافت نشد.</p>}
        </div>
    );

    if (isLoading) {
        return <p>در حال بارگذاری وضعیت واکسیناسیون...</p>;
    }

    const overdue = vaccinationStatus.filter(v => v.status === 'overdue');
    const upcoming = vaccinationStatus.filter(v => v.status === 'upcoming');

    return (
        <div className="vaccination-status-container">
            {renderVaccineList(overdue, 'عقب افتاده', faExclamationTriangle)}
            {renderVaccineList(upcoming, 'آینده', faClock)}
        </div>
    );
};

export default VaccinationStatus;
