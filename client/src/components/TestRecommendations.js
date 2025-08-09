import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

const TestRecommendations = () => {
    const { childId } = useParams();
    const [recommendations, setRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRecommendations = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/recommended-tests/${childId}`);
            const data = await res.json();
            setRecommendations(data);
        } catch (error) {
            console.error("Failed to fetch recommendations", error);
        } finally {
            setIsLoading(false);
        }
    }, [childId]);

    useEffect(() => {
        fetchRecommendations();
    }, [fetchRecommendations]);

    if (isLoading) {
        return <p>در حال بارگذاری پیشنهادات...</p>;
    }

    return (
        <div className="recommended-checkups">
            <h4>چکاپ‌های پیشنهادی برای این گروه سنی</h4>
            {recommendations.length > 0 ? (
                <ul>
                    {recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                </ul>
            ) : (
                <p>هیچ پیشنهاد جدیدی وجود ندارد.</p>
            )}
        </div>
    );
};

export default TestRecommendations;
