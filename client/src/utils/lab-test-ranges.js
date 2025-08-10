// Note: These ranges are for demonstration purposes only and are not a substitute for professional medical advice.

export const labTestRanges = {
    'Vitamin D': {
        unit: 'ng/mL',
        ranges: [
            { age_months: [0, 1200], ref_low: 20, ref_high: 50, interpretation: { low: 'سطح ویتامین D پایین است که می‌تواند بر سلامت استخوان تاثیر بگذارد.', normal: 'سطح ویتامین D در محدوده طبیعی است.', high: 'سطح ویتامین D بالاتر از حد طبیعی است.' } }
        ]
    },
    'Hemoglobin': {
        unit: 'g/dL',
        ranges: [
            { age_months: [0, 6], ref_low: 9.5, ref_high: 14.0, interpretation: { low: 'پایین (احتمال کم‌خونی)', normal: 'نرمال', high: 'بالا' } },
            { age_months: [6, 144], ref_low: 10.5, ref_high: 15.5, interpretation: { low: 'پایین (احتمال کم‌خونی)', normal: 'نرمال', high: 'بالا' } }
        ]
    },
    'WBC': {
        unit: 'x10^9/L',
        ranges: [
            { age_months: [0, 1], ref_low: 9.0, ref_high: 30.0, interpretation: { low: 'پایین (احتمال عفونت یا مشکل ایمنی)', normal: 'نرمال', high: 'بالا (احتمال عفونت)' } },
            { age_months: [1, 24], ref_low: 6.0, ref_high: 17.5, interpretation: { low: 'پایین (احتمال عفونت یا مشکل ایمنی)', normal: 'نرمال', high: 'بالا (احتمال عفونت)' } },
            { age_months: [24, 144], ref_low: 5.0, ref_high: 15.5, interpretation: { low: 'پایین (احتمال عفونت یا مشکل ایمنی)', normal: 'نرمال', high: 'بالا (احتمال عفونت)' } },
        ]
    },
    'Platelets': {
        unit: 'x10^9/L',
        ranges: [
            { age_months: [0, 1200], ref_low: 150, ref_high: 450, interpretation: { low: 'پایین (خطر خونریزی)', normal: 'نرمال', high: 'بالا (خطر لخته شدن خون)' } },
        ]
    },
    'TSH': {
        unit: 'mIU/L',
        ranges: [
            { age_months: [0, 1200], ref_low: 0.4, ref_high: 4.0, interpretation: { low: 'پایین (احتمال پرکاری تیروئید)', normal: 'نرمال', high: 'بالا (احتمال کم‌کاری تیروئید)' } }
        ]
    },
    'Bilirubin, Total': {
        unit: 'mg/dL',
        ranges: [
            { age_months: [0, 1200], ref_low: 0.1, ref_high: 1.2, interpretation: { low: 'نرمال', normal: 'نرمال', high: 'بالا (نیاز به بررسی عملکرد کبد)' } }
        ]
    },
    'ALT': {
        unit: 'U/L',
        ranges: [
            { age_months: [0, 1200], ref_low: 7, ref_high: 55, interpretation: { low: 'نرمال', normal: 'نرمال', high: 'بالا (آسیب کبدی)' } }
        ]
    },
    'Iron': {
        unit: 'mcg/dL',
        ranges: [
            { age_months: [6, 24], ref_low: 40, ref_high: 100, interpretation: { low: 'پایین (کمبود آهن)', normal: 'نرمال', high: 'بالا' } },
            { age_months: [24, 144], ref_low: 50, ref_high: 120, interpretation: { low: 'پایین (کمبود آهن)', normal: 'نرمال', high: 'بالا' } }
        ]
    },
};

export const getTestStatus = (testType, ageInMonths, value) => {
    const testInfo = labTestRanges[testType];
    if (!testInfo || value === null || value === undefined || value === '') {
        return { status: 'نامشخص', className: 'status-unknown', interpretation: null };
    }

    const applicableRange = testInfo.ranges.find(r => ageInMonths >= r.age_months[0] && ageInMonths < r.age_months[1]);
    if (!applicableRange) {
        return { status: 'محدوده نامشخص', className: 'status-unknown', interpretation: null };
    }

    if (value < applicableRange.ref_low) {
        return { status: 'پایین', className: 'status-low', interpretation: applicableRange.interpretation.low };
    }
    if (value > applicableRange.ref_high) {
        return { status: 'بالا', className: 'status-high', interpretation: applicableRange.interpretation.high };
    }
    return { status: 'نرمال', className: 'status-normal', interpretation: applicableRange.interpretation.normal };
};
