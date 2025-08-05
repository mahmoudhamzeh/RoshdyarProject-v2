// Note: These ranges are for demonstration purposes only and are not a substitute for professional medical advice.

export const labTestRanges = {
    'Vitamin D': {
        unit: 'ng/mL',
        ranges: [
            { age_months: [0, 1200], low: 20, high: 50, interpretation: { low: 'Deficiency', normal: 'Sufficient', high: 'Potential Toxicity' } }
        ]
    },
    'Hemoglobin': {
        unit: 'g/dL',
        ranges: [
            { age_months: [0, 0.5], low: 13.5, high: 24.0 },
            { age_months: [0.5, 2], low: 10.0, high: 18.0 },
            { age_months: [2, 6], low: 9.5, high: 14.0 },
            { age_months: [6, 24], low: 10.5, high: 13.5 },
            { age_months: [24, 144], low: 11.5, high: 15.5 },
        ]
    },
    'CBC': {
        // This is a placeholder as CBC has many components.
        // We are using Hemoglobin as a representative part.
        unit: '',
        ranges: []
    }
};

export const getTestStatus = (testType, ageInMonths, value) => {
    const testInfo = labTestRanges[testType];
    if (!testInfo || value === null || value === undefined) {
        return { status: 'نامشخص', className: 'status-unknown' };
    }

    const applicableRange = testInfo.ranges.find(r => ageInMonths >= r.age_months[0] && ageInMonths < r.age_months[1]);
    if (!applicableRange) {
        return { status: 'محدوده نامشخص', className: 'status-unknown' };
    }

    if (value < applicableRange.low) {
        return { status: 'پایین', className: 'status-low' };
    }
    if (value > applicableRange.high) {
        return { status: 'بالا', className: 'status-high' };
    }
    return { status: 'نرمال', className: 'status-normal' };
};
