const vaccinationSchedule = [
    {
        age: 0,
        label: 'بدو تولد',
        vaccines: [
            { name: 'ب ث ژ', details: 'یک نوبت' },
            { name: 'هپاتیت ب', details: 'نوبت اول' }
        ]
    },
    {
        age: 2,
        label: '۲ ماهگی',
        vaccines: [
            { name: 'سه‌گانه', details: 'نوبت اول' },
            { name: 'فلج اطفال خوراکی', details: 'نوبت اول' },
            { name: 'هپاتیت ب', details: 'نوبت دوم' }
        ]
    },
    {
        age: 4,
        label: '۴ ماهگی',
        vaccines: [
            { name: 'سه‌گانه', details: 'نوبت دوم' },
            { name: 'فلج اطفال خوراکی', details: 'نوبت دوم' }
        ]
    },
    {
        age: 6,
        label: '۶ ماهگی',
        vaccines: [
            { name: 'سه‌گانه', details: 'نوبت سوم' },
            { name: 'فلج اطفال خوراکی', details: 'نوبت سوم' },
            { name: 'هپاتیت ب', details: 'نوبت سوم' }
        ]
    },
    {
        age: 12,
        label: '۱۲ ماهگی',
        vaccines: [
            { name: 'MMR', details: 'نوبت اول' }
        ]
    },
    {
        age: 18,
        label: '۱۸ ماهگی',
        vaccines: [
            { name: 'سه‌گانه', details: 'یادآور اول' },
            { name: 'فلج اطفال خوراکی', details: 'یادآور اول' },
            { name: 'MMR', details: 'یادآور' }
        ]
    },
    {
        age: 60, // 4-6 years old
        label: '۴ تا ۶ سالگی',
        vaccines: [
            { name: 'سه‌گانه', details: 'یادآور دوم' },
            { name: 'فلج اطفال خوراکی', details: 'یادآور دوم' }
        ]
    }
];

module.exports = { vaccinationSchedule };
