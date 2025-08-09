// Note: These ranges are for demonstration purposes only and are not a substitute for professional medical advice.

export const labTestRanges = {
    'Vitamin D': {
        unit: 'ng/mL',
        ranges: [
            {
                age_months: [0, 1200],
                low: 20,
                high: 50,
                interpretation: {
                    low: 'سطح ویتامین D پایین است که می‌تواند بر سلامت استخوان تاثیر بگذارد. توصیه به مشورت با پزشک می‌شود.',
                    normal: 'سطح ویتامین D در محدوده طبیعی است.',
                    high: 'سطح ویتامین D بالاتر از حد طبیعی است. مقادیر بسیار بالا می‌تواند مسمومیت‌زا باشد.'
                }
            }
        ]
    },
    'Hemoglobin': {
        unit: 'g/dL',
        ranges: [
            { age_months: [0, 6], low: 9.5, high: 14.0, interpretation: { low: 'میزان هموگلوبین پایین است و ممکن است نشانه کم‌خونی باشد. لطفاً با پزشک مشورت کنید.', normal: 'میزان هموگلوبین در محدوده طبیعی است.', high: 'میزان هموگلوبین بالاتر از حد طبیعی است.' } },
            { age_months: [6, 144], low: 10.5, high: 15.5, interpretation: { low: 'میزان هموگلوبین پایین است و ممکن است نشانه کم‌خونی باشد. لطفاً با پزشک مشورت کنید.', normal: 'میزان هموگلوبین در محدوده طبیعی است.', high: 'میزان هموگلوبین بالاتر از حد طبیعی است.' } }
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
    if (!testInfo || value === null || value === undefined || value === '') {
        return { status: 'نامشخص', className: 'status-unknown', interpretation: null };
    }

    const applicableRange = testInfo.ranges.find(r => ageInMonths >= r.age_months[0] && ageInMonths < r.age_months[1]);
    if (!applicableRange) {
        return { status: 'محدوده نامشخص', className: 'status-unknown', interpretation: null };
    }

    if (value < applicableRange.low) {
        return { status: 'پایین', className: 'status-low', interpretation: applicableRange.interpretation.low };
    }
    if (value > applicableRange.high) {
        return { status: 'بالا', className: 'status-high', interpretation: applicableRange.interpretation.high };
    }
    return { status: 'نرمال', className: 'status-normal', interpretation: applicableRange.interpretation.normal };
};
