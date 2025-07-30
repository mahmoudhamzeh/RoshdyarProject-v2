// WHO Growth Standards (0-60 months)
// Data represents Length/Height for Age (cm) and Weight for Age (kg)
// P3, P50, P97 represent the 3rd, 50th (median), and 97th percentiles.

const heightForAgeBoys = [
    { month: 0, P3: 46.1, P50: 49.9, P97: 53.7 },
    { month: 2, P3: 54.7, P50: 58.4, P97: 62.2 },
    { month: 4, P3: 59.9, P50: 63.9, P97: 67.8 },
    { month: 6, P3: 63.6, P50: 67.6, P97: 71.6 },
    { month: 12, P3: 71.0, P50: 75.7, P97: 80.5 },
    { month: 24, P3: 81.0, P50: 86.4, P97: 91.8 },
    { month: 36, P3: 87.8, P50: 93.5, P97: 99.3 },
    { month: 48, P3: 93.6, P50: 99.9, P97: 106.2 },
    { month: 60, P3: 98.7, P50: 105.3, P97: 112.0 }
];

const weightForAgeBoys = [
    { month: 0, P3: 2.5, P50: 3.3, P97: 4.4 },
    { month: 2, P3: 4.4, P50: 5.6, P97: 7.1 },
    { month: 4, P3: 5.7, P50: 7.0, P97: 8.7 },
    { month: 6, P3: 6.7, P50: 8.0, P97: 9.9 },
    { month: 12, P3: 8.3, P50: 9.9, P97: 11.8 },
    { month: 24, P3: 10.5, P50: 12.5, P97: 14.8 },
    { month: 36, P3: 12.2, P50: 14.5, P97: 17.2 },
    { month: 48, P3: 13.7, P50: 16.3, P97: 19.3 },
    { month: 60, P3: 15.1, P50: 18.0, P97: 21.2 }
];

const heightForAgeGirls = [
    { month: 0, P3: 45.4, P50: 49.1, P97: 52.9 },
    { month: 2, P3: 53.0, P50: 57.1, P97: 61.1 },
    { month: 4, P3: 58.0, P50: 62.1, P97: 66.2 },
    { month: 6, P3: 61.5, P50: 65.7, P97: 70.0 },
    { month: 12, P3: 68.9, P50: 74.0, P97: 79.2 },
    { month: 24, P3: 79.1, P50: 85.1, P97: 91.0 },
    { month: 36, P3: 85.9, P50: 92.4, P97: 98.9 },
    { month: 48, P3: 92.0, P50: 99.0, P97: 105.9 },
    { month: 60, P3: 96.4, P50: 104.7, P97: 112.9 }
];

const weightForAgeGirls = [
    { month: 0, P3: 2.4, P50: 3.2, P97: 4.2 },
    { month: 2, P3: 4.0, P50: 5.1, P97: 6.5 },
    { month: 4, P3: 5.4, P50: 6.4, P97: 8.2 },
    { month: 6, P3: 6.4, P50: 7.3, P97: 9.3 },
    { month: 12, P3: 7.6, P50: 9.2, P97: 11.1 },
    { month: 24, P3: 9.8, P50: 11.8, P97: 14.1 },
    { month: 36, P3: 11.4, P50: 13.8, P97: 16.5 },
    { month: 48, P3: 12.8, P50: 15.5, P97: 18.6 },
    { month: 60, P3: 14.1, P50: 17.0, P97: 20.2 }
];

export const whoStats = {
    heightForAgeBoys,
    weightForAgeBoys,
    heightForAgeGirls,
    weightForAgeGirls,
};
