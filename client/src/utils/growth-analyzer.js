import { whoStats } from '../who-stats';

const getPercentileForValue = (value, ageInMonths, gender, metric) => {
    const table = whoStats[`${metric}ForAge${gender === 'boy' ? 'Boys' : 'Girls'}`];
    if (!table) return null;
    let lowerBound, upperBound;
    for (const row of table) {
        if (row.month <= ageInMonths) lowerBound = row;
        if (row.month >= ageInMonths && !upperBound) upperBound = row;
    }
    if (!lowerBound || !upperBound) return null;
    const interpolate = (p1, p2) => {
        if (p1.month === p2.month) return p1;
        const factor = (ageInMonths - p1.month) / (p2.month - p1.month);
        return { P3: p1.P3 + factor * (p2.P3 - p1.P3), P50: p1.P50 + factor * (p2.P50 - p1.P50), P97: p1.P97 + factor * (p2.P97 - p1.P97) };
    };
    const standard = interpolate(lowerBound, upperBound);
    if (value < standard.P3) return 3;
    if (value > standard.P97) return 97;
    if (value < standard.P50) return 3 + 47 * ((value - standard.P3) / (standard.P50 - standard.P3));
    return 50 + 47 * ((value - standard.P50) / (standard.P97 - standard.P50));
};

export const getAbsoluteStatus = (percentile) => {
    if (percentile === null) return 'نامشخص';
    if (percentile < 3) return 'کمبود';
    if (percentile > 97) return 'اضافه';
    return 'نرمال';
};

export const analyzeGrowthMetric = (metric, child) => {
    if (!child || !child.growthData || child.growthData.length === 0) {
        return { value: null, status: 'نامشخص', trend: 'stable' };
    }

    const calculateAgeInMonths = (date) => (new Date(date) - new Date(child.birthDate)) / (1000 * 60 * 60 * 24 * 30.4375);

    const sortedData = [...child.growthData].sort((a, b) => new Date(a.date) - new Date(b.date));
    const recordsWithMetric = sortedData.filter(r => r[metric] !== undefined && r[metric] !== null);

    if (recordsWithMetric.length === 0) {
        return { value: null, status: 'نامشخص', trend: 'stable' };
    }

    const latestRecord = recordsWithMetric[recordsWithMetric.length - 1];
    const latestAge = calculateAgeInMonths(latestRecord.date);
    const latestP = getPercentileForValue(latestRecord[metric], latestAge, child.gender, metric);

    let trend = 'stable';
    if (recordsWithMetric.length >= 2) {
        const previousRecord = recordsWithMetric[recordsWithMetric.length - 2];
        const previousAge = calculateAgeInMonths(previousRecord.date);
        const previousP = getPercentileForValue(previousRecord[metric], previousAge, child.gender, metric);
        if (latestP !== null && previousP !== null) {
            const diff = latestP - previousP;
            if (Math.abs(diff) > 5) {
                trend = diff > 0 ? 'improving' : 'declining';
            }
        }
    }

    return {
        value: latestRecord[metric],
        percentile: latestP,
        status: getAbsoluteStatus(latestP),
        trend: trend
    };
};
