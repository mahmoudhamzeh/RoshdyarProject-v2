'use strict';

const TRIAGE = {
    NORMAL_VARIATION: 'NORMAL_VARIATION',
    MONITOR_CLOSELY: 'MONITOR_CLOSELY',
    CONSULT_SPECIALIST: 'CONSULT_SPECIALIST'
};

const HARD_RED = [
    'تشنج', 'سیاه شدن لب', 'تنگی نفس', 'قطع تنفس', 'بی‌حال شدید', 'بیحال شدید',
    'تب بالای ۴۰', 'تب 40', 'پسرفت مهارت', 'مهارت را از دست', 'از دست دادن مهارت',
    'عدم تماس چشمی کامل', 'اصلا نگاه نمی‌کند', 'اصلا نگاه نميکند'
];

const SPEECH = ['حرف', 'کلمه', 'گفتار', 'جیغ', 'اشاره', 'صدا', 'اسمش'];
const MOTOR = ['راه', 'قدم', 'ایست', 'نشستن', 'چهار دست', 'تعادل', 'افتادن'];
const SLEEP = ['خواب', 'بیدار', 'چرت', 'شب'];
const FOOD = ['غذا', 'شیر', 'قاشق', 'بدغذا', 'اشتها'];
const BEHAVIOR = ['قشقرق', 'لجباز', 'لج می‌', 'گاز می', 'جدايي', 'جدایی', 'ترس از'];

function monthsOf(child) {
    const n = Number(child && (child.age_in_months || child.ageInMonths));
    return Number.isFinite(n) ? n : 0;
}

function hasAny(text, list) {
    return list.some((word) => text.includes(word));
}

function analyzeConcernLocal(child, concernText) {
    const name = (child && (child.name || child.firstName)) || 'کودک';
    const months = monthsOf(child);
    const gender = child && (child.gender === 'girl' || child.gender === 'female') ? 'دختر' : 'پسر';
    const text = String(concernText || '').trim();
    const lower = text;

    if (!text) {
        return {
            triage_status: TRIAGE.NORMAL_VARIATION,
            status_badge: { text: 'هنوز نگرانی نوشته نشده', color: 'green' },
            summary_verdict: `برای ${name} یک جمله کوتاه درباره نگرانی‌تان بنویسید تا راهنمایی متناسب با سن ${months} ماهگی بدهیم.`,
            analysis: {
                motor_explanation: '',
                speech_explanation: ''
            },
            home_actions: [],
            red_flags_to_watch: [],
            recommended_action: {
                needs_doctor_visit: false,
                cta_text: 'بازگشت به کارهای امروز',
                cta_url: ''
            }
        };
    }

    const urgent = hasAny(lower, HARD_RED);
    const speech = hasAny(lower, SPEECH);
    const motor = hasAny(lower, MOTOR);
    const sleep = hasAny(lower, SLEEP);
    const food = hasAny(lower, FOOD);
    const behavior = hasAny(lower, BEHAVIOR);

    let status = TRIAGE.NORMAL_VARIATION;
    if (urgent) status = TRIAGE.CONSULT_SPECIALIST;
    else if ((motor && months >= 18 && /راه|قدم/.test(lower)) || (speech && months >= 18 && /هیچ کلم|کلمه‌ای نمی|کلمه ای نمی/.test(lower))) {
        status = TRIAGE.MONITOR_CLOSELY;
    } else if ((motor && months >= 15 && /اصلا.*راه|تنهایی راه نمی/.test(lower)) || (speech && months >= 15 && /اصلا حرف|هیچ کلم/.test(lower))) {
        status = TRIAGE.MONITOR_CLOSELY;
    }

    const badge = status === TRIAGE.CONSULT_SPECIALIST
        ? { text: 'نیاز به بررسی تخصصی', color: 'red' }
        : status === TRIAGE.MONITOR_CLOSELY
            ? { text: 'نیاز به پیگیری نزدیک', color: 'yellow' }
            : { text: 'روند طبیعی رشد در این بازه سنی', color: 'green' };

    let summary = `برای ${name} در حدود ${months} ماهگی، اگر نگرانی مشخص‌تری درباره حرکت، حرف زدن، غذا، خواب یا رفتار بنویسید راهنمایی دقیق‌تری می‌دهم.`;
    if (motor && months < 18) {
        summary = `تا حدود ۱۸ ماهگی راه نرفتن مستقل در بسیاری از کودکان دیده می‌شود؛ اگر می‌ایستد یا با کمک جابه‌جا می‌شود معمولاً روند طبیعی است.`;
    } else if (motor && months >= 18) {
        summary = `در ${months} ماهگی اگر ${name} هنوز تنهایی راه نمی‌رود، این را با پزشک کودک پیگیری کنید؛ دیگر بازه رایج ۹ تا ۱۸ ماهگی نیست.`;
    } else if (speech || sleep || food || behavior) {
        summary = `برای ${gender} ${months} ماهه، خیلی از تفاوت‌ها هنوز در بازه طبیعی است.`;
    }
    if (speech && months < 16) {
        summary = `${summary} در این سن اشاره، آوا و یکی‌دو کلمه معنی‌دار مهم‌تر از جمله کامل است.`;
    }
    if (urgent) {
        summary = 'با توجه به نشانه‌هایی که نوشتید، این موضوع را زود با پزشک کودک مطرح کنید. این پیام تشخیص نیست.';
    }

    const analysis = {
        motor_explanation: motor
            ? (months < 18
                ? 'کودکان معمولاً بین ۹ تا ۱۸ ماهگی راه می‌افتند. ایستادن با تکیه یا چند قدم با دست شما نشانه تقویت عضله است، نه تأخیر قطعی.'
                : 'بعد از ۱۸ ماهگی اگر هنوز بدون کمک نمی‌ایستد یا راه نمی‌رود، بهتر است وضعیت حرکت توسط پزشک بررسی شود.')
            : '',
        speech_explanation: speech
            ? (months < 16
                ? 'جیغ یا اشاره برای درخواست در این سن رایج است. مهم این است که به اسمش واکنش بدهد و اشاره هدفمند داشته باشد؛ شما مدل کلمه را آرام تکرار کنید.'
                : 'اگر پس از ۱۶–۱۸ ماهگی هیچ کلمه معنی‌دار یا اشاره‌ای نیست، یا تماس چشمی خیلی کم است، پیگیری گفتار و شنوایی توصیه می‌شود.')
            : ''
    };

    const home_actions = [];
    if (motor) {
        home_actions.push({
            title: 'تشویق با بازی هل‌دادن',
            description: 'با نظارت، جعبه سبک یا واگن ایمن را هل بدهد تا اعتمادبه‌نفس قدم برداشتن بیشتر شود. هل‌دادن اجباری نکنید.'
        });
    }
    if (speech) {
        home_actions.push({
            title: 'پاسخ کلامی به جیغ یا اشاره',
            description: 'وقتی اشاره یا جیغ می‌زند، اسم خواسته‌اش را آرام بگویید: «آب می‌خوای؟ بفرما آب» و بعد خواسته را برآورده کنید.'
        });
    }
    if (sleep) {
        home_actions.push({
            title: 'روتین کوتاه و ثابت شب',
            description: 'هر شب همان سه کار کوتاه (مثلاً کتاب، نور کم، بغل آرام) را تکرار کنید. پاسخ شب را یکنواخت نگه دارید.'
        });
    }
    if (food) {
        home_actions.push({
            title: 'دو انتخاب کوچک در غذا',
            description: 'بین دو خوراک نرم و ایمن انتخاب بدهید. زمان غذا را محدود و بدون اجبار تمام کنید.'
        });
    }
    if (behavior) {
        home_actions.push({
            title: 'مرز کوتاه با حضور آرام',
            description: 'در قشقرق نزدیک بمانید، جمله را کوتاه کنید («نه، گاز نه») و بعد کار بعدی را نشان دهید.'
        });
    }
    if (!home_actions.length) {
        home_actions.push({
            title: 'مشاهده کوتاه و ثبت',
            description: `تا چند روز بازی و ارتباط ${name} را در همین سن دنبال کنید و اگر نشانه تازه نگران‌کننده دیدید دوباره بنویسید.`
        });
    }

    const red_flags_to_watch = [
        months >= 15 ? 'عدم توانایی ایستادن حتی با تکیه تا ۱۵ ماهگی' : 'سستی شدید بدن یا استفاده نکردن از یک سمت بدن',
        'عدم واکنش به صدا زدن نام یا قطع شدن تماس چشمی',
        'از دست رفتن مهارتی که قبلاً پایدار بوده'
    ];

    return {
        triage_status: status,
        status_badge: badge,
        summary_verdict: summary,
        analysis,
        home_actions,
        red_flags_to_watch,
        recommended_action: {
            needs_doctor_visit: status === TRIAGE.CONSULT_SPECIALIST,
            cta_text: status === TRIAGE.CONSULT_SPECIALIST
                ? 'رزرو نوبت مشاوره رشد و تکامل'
                : 'در صورت تمایل، چکاپ رشد با متخصص تات‌کیدز',
            cta_url: '/dashboard'
        }
    };
}

function analysisToChatReply(analysis) {
    const lines = [analysis.summary_verdict];
    const home = (analysis.home_actions || []).slice(0, 3);
    if (home.length) {
        lines.push(`الان در خانه:\n${home.map((item, index) => `${index + 1}. ${item.title}: ${item.description}`).join('\n')}`);
    }
    if (analysis.recommended_action && analysis.recommended_action.needs_doctor_visit) {
        lines.push('این مورد را زود با پزشک کودک مطرح کنید. این پیام تشخیص پزشکی نیست.');
    } else {
        lines.push('این راهنما آموزشی است و جای معاینه پزشک را نمی‌گیرد.');
    }
    return lines.filter(Boolean).join('\n\n');
}

function lastUserText(messages) {
    const list = Array.isArray(messages) ? messages : [];
    for (let i = list.length - 1; i >= 0; i -= 1) {
        if (list[i] && list[i].role === 'user' && String(list[i].content || '').trim()) {
            return String(list[i].content).trim();
        }
    }
    return '';
}

function withDisclaimer(text) {
    return `${String(text || '').trim()}\n\nاین راهنما آموزشی است و جای معاینه پزشک را نمی‌گیرد.`;
}

function defaultFoodAdvice(months) {
    if (months < 6) return 'در این سن تغذیه اصلی شیر مادر یا شیر خشک مناسب است؛ غذای کمکی معمولاً بعد از حدود ۶ ماهگی و با نظر پزشک شروع می‌شود.';
    if (months < 12) return 'شیر همچنان پایه است و غذای نرم خانواده (پوره، میوه نرم، گوشت نرم) کم‌کم اضافه می‌شود. نمک و شکر اضافه ندهید.';
    if (months < 24) return 'لقمه‌های نرم غذای خانواده، تنوع رنگ و بافت، و دو انتخاب کوچک معمولاً بهتر از اجبار جواب می‌دهد.';
    return 'سه وعده اصلی خانواده با میان‌وعده سالم کافی است. زمان غذا را کوتاه و بدون جنگ تمام کنید.';
}

function defaultSleepAdvice(months) {
    if (months < 6) return 'خواب هنوز نامنظم است. به پشت در سطح سفت بخوابانید و پاسخ شب را آرام و کم‌نور نگه دارید.';
    if (months < 12) return 'روتین کوتاه شب (کتاب، نور کم، بغل آرام) و فاصله ثابت بین چرت‌ها معمولاً کمک می‌کند.';
    if (months < 24) return 'یک روتین ثابت ۲۰ دقیقه‌ای بهتر از حرف زیاد است. بیداری شب را کوتاه و تکراری پاسخ دهید.';
    return 'ساعت خواب نسبتاً ثابت، فعالیت روز و پرهیز از صفحه نمایش نزدیک خواب معمولاً مؤثرتر از بحث شبانه است.';
}

function classifyChatIntent(text) {
    const raw = String(text || '').trim();
    if (!raw) return 'empty';
    const t = raw.replace(/\s+/g, ' ');
    if (hasAny(t, HARD_RED) || /تب بالا|تب ۴۰|تب 40|تنگی نفس|قطع تنفس/.test(t)) return 'urgent';
    if (/^(سلام|درود|هی|hello|hi|صبح بخیر|عصر بخیر|وقت بخیر)([\s!؟?.].*)?$/i.test(t)
        || /سلام خوبی|سلام دستیار|خوبی\??$/.test(t)) {
        return 'greeting';
    }
    if (/ممنون|مرسی|متشکرم|خداحافظ|thanks/.test(t)) return 'thanks';
    if (/کی هستی|چیکار میکنی|چه کمکی|چطور کمک|چه کاری میتونی/.test(t)) return 'identity';
    if (/دندان|دندون|لثه/.test(t)) return 'teeth';
    if (/تب/.test(t)) return 'fever';
    if (/واکسن|تزریق|ایمن[ -]?سازی/.test(t)) return 'vaccine';
    if (/پوشک|دستشویی|لگن|توالت|توآلت|پی[ -]?پی|ادرار|مدفوع/.test(t)) return 'potty';
    if (/(قد و وزن|قدش|وزنش|وزن[ -]?گیری|صدک|نمودار رشد|خیلی چاق|خیلی لاغر)/.test(t)
        || (/قد/.test(t) && /(وزن|سانتی|سم|کوتاه|بلند)/.test(t) && !/چقدر/.test(t))) {
        return 'growth';
    }
    if (/چی بخور|چه .*خور|بخورد|تغذیه|غذا|اشتها|بدغذا|شیر مادر|شیر خشک|لقمه|صبحانه|ناهار/.test(t)) return 'food';
    if (/خواب|بیدار|چرت|بدخواب/.test(t)) return 'sleep';
    if (/قشقرق|لجباز|گاز میگ|کتک|نه میگه|جدایی|جدايي|ترس شب/.test(t)) return 'behavior';
    if (/بازی|سرگرمی|اسباب[ -]?بازی|فعالیت امروز/.test(t)) return 'play';
    if (/حرف نمی|کلمه|گفتار|صحبت|اشاره نمی|جیغ میزن/.test(t)) return 'speech';
    if (/راه نمی|راه رفتن|قدم برنمی|نمی[ \u200c]?ایست|نمی[ \u200c]?شینه|چهار دست|تنهایی راه/.test(t)) return 'motor';
    if (/نگران|تأخیر|تاخیر|عقب افتاد|رشدش|وضعیت کلی|چطوره رشد/.test(t)) return 'general';
    if (/قیمت|خرید|سفارش|کد تخفیف|فروشگاه|ارسال/.test(t)) return 'offtopic';
    return 'general';
}

function chatGrowthAssistantLocal(child, messages, context) {
    const name = (child && (child.name || child.firstName)) || 'کودک';
    const months = monthsOf(child);
    const ageLabel = (context && context.bandTitle) || `${months} ماهگی`;
    const ctx = context || {};
    const last = lastUserText(messages);
    const intent = classifyChatIntent(last);

    if (intent === 'empty') {
        return `سلام، من دستیار رشد ${name} هستم. سنش حدود ${ageLabel} است. از قد و وزن، غذا، خواب، دندان، واکسن یا نگرانی‌تان بپرسید.`;
    }
    if (intent === 'urgent') {
        return withDisclaimer(`با نشانه‌هایی که نوشتید این موضوع را همین امروز با پزشک کودک یا اورژانس مطرح کنید. برای ${name} در ${ageLabel} صبر کردن درست نیست.`);
    }
    if (intent === 'greeting') {
        return `سلام. من دستیار رشد ${name} هستم و سنش حدود ${ageLabel} است. بپرسید مثلاً چه بخورد، خوابش چطور باشد، دندون درآوردن، واکسن یا نگرانی حرکتی‌اش.`;
    }
    if (intent === 'thanks') {
        return `خواهش می‌کنم. هر وقت درباره رشد ${name} سؤال تازه‌ای داشتید همین‌جا بنویسید.`;
    }
    if (intent === 'identity') {
        return `من دستیار رشد تات‌کیدز برای ${name} هستم. بر اساس سن ${ageLabel} درباره غذا، خواب، حرکت، گفتار و نگرانی‌های رایج راهنمایی آموزشی می‌دهم؛ تشخیص پزشکی نمی‌دهم.`;
    }
    if (intent === 'teeth') {
        if (months >= 36) {
            return withDisclaimer(`تا حدود ۳ سالگی معمولاً بیشتر دندان‌های شیری درآمده‌اند. برای ${name} در ${ageLabel} اگر چند دندان اصلی نیست، درد شدید یا تورم صورت دیدید به دندان‌پزشک کودکان مراجعه کنید.`);
        }
        return withDisclaimer(`درآوردن دندان زمان ثابتی ندارد و برای ${name} در ${ageLabel} دیر یا زود بودنش به‌تنهایی تأخیر رشد نیست. لثه متورم، بی‌قراری و آب دهان شایع است. لثه را با پارچه تمیز سرد آرام کنید، دارو را بدون نظر پزشک شروع نکنید و اگر تب بالا، بی‌حالی یا امتناع از مایعات دیدید به پزشک مراجعه کنید.`);
    }
    if (intent === 'fever') {
        return withDisclaimer(`تب را با دماسنج اندازه بگیرید. برای ${name} اگر حال عمومی بد، تنفس سخت، تشنج، جوش غیرعادی یا تب طول‌کشیده دیدید زود به پزشک مراجعه کنید. این چت جای معاینه تب را نمی‌گیرد.`);
    }
    if (intent === 'vaccine') {
        return withDisclaimer(`برنامه واکسن ${name} را از صفحه واکسیناسیون همین سامانه ببینید. تب خفیف یا بی‌قراری بعد تزریق شایع است؛ ورم شدید، تنگی نفس یا حال خیلی بد را فوری به پزشک بگویید.`);
    }
    if (intent === 'potty') {
        return withDisclaimer(`آمادگی دستشویی بیشتر به نشانه کودک بستگی دارد تا یک سن دقیق. برای ${name} در ${ageLabel} اجبار و تنبیه معمولاً نتیجه معکوس دارد. وقتی خودش علاقه نشان داد لگن را معرفی کنید و تصادف را عادی بگیرید.`);
    }
    if (intent === 'growth') {
        if (!ctx.heightLabel && !ctx.weightLabel) {
            return withDisclaimer(`قد و وزن ${name} هنوز در نمودار رشد ثبت نشده. یک اندازه‌گیری ثبت کنید تا بگویم آخرین عدد چیست. از یک عدد به‌تنهایی نتیجه پزشکی گرفته نمی‌شود.`);
        }
        const height = ctx.heightLabel || 'قد هنوز ثبت نشده';
        const weight = ctx.weightLabel || 'وزن هنوز ثبت نشده';
        return withDisclaimer(`آخرین اندازه‌گیری ${name}: ${height} و ${weight}. روند چند نقطه روی نمودار مهم‌تر از یک عدد است؛ تفسیر نهایی با پزشک کودک است.`);
    }
    if (intent === 'food') {
        const overview = ctx.nutrition || defaultFoodAdvice(months);
        return withDisclaimer(`برای ${name} در ${ageLabel}: ${overview}\nاگر آلرژی یا بیماری ثبت شده، هر تغییر غذا را با پزشک هماهنگ کنید.`);
    }
    if (intent === 'sleep') {
        const overview = ctx.sleep || defaultSleepAdvice(months);
        return withDisclaimer(`خواب این سن برای ${name}: ${overview}\nروتین کوتاه و ثابت شب معمولاً بهتر از حرف زیاد جواب می‌دهد.`);
    }
    if (intent === 'play') {
        return withDisclaimer(`برای ${name} در ${ageLabel} بازی کوتاه حضوری بهتر از صفحه نمایش است: چند دقیقه روی زمین، کتاب، صدا درآوردن یا هل دادن اسباب ایمن. فعالیت‌های امروز همین صفحه را هم می‌توانید استفاده کنید.`);
    }
    if (intent === 'offtopic') {
        return `من فقط درباره رشد و مراقبت ${name} جواب می‌دهم. از غذا، خواب، قد و وزن، دندان، واکسن یا نگرانی رشد بپرسید.`;
    }
    if (intent === 'motor' || intent === 'speech' || intent === 'behavior') {
        return analysisToChatReply(analyzeConcernLocal(child, last));
    }
    return withDisclaimer(`برای ${name} در حدود ${ageLabel}، رشد هر کودک ریتم خودش را دارد. سؤال را دقیق‌تر بپرسید: غذا، خواب، راه رفتن، حرف زدن، دندان یا قد و وزن. اگر نشانه خطر (تب بالا، تنگی نفس، تشنج، از دست رفتن مهارت) دیدید به پزشک مراجعه کنید.`);
}

async function chatGrowthAssistant(child, messages, context) {
    const apiKey = process.env.OPENAI_API_KEY || process.env.GROWTH_AI_KEY;
    const localReply = chatGrowthAssistantLocal(child, messages, context);
    if (!apiKey) return { reply: localReply, source: 'local' };

    const endpoint = process.env.GROWTH_AI_URL || 'https://api.openai.com/v1/chat/completions';
    const model = process.env.GROWTH_AI_MODEL || 'gpt-4o-mini';
    const history = (Array.isArray(messages) ? messages : [])
        .filter((item) => item && (item.role === 'user' || item.role === 'assistant') && item.content)
        .slice(-12)
        .map((item) => ({ role: item.role, content: String(item.content).slice(0, 1200) }));
    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                temperature: 0.3,
                messages: [
                    {
                        role: 'system',
                        content: 'شما دستیار رشد تات‌کیدز هستید. فقط به همان سؤالی که کاربر پرسیده جواب بدهید؛ اگر درباره دندان، تب، واکسن، غذا یا خواب پرسید درباره راه رفتن حرف نزنید. کوتاه، آرام و فارسی بنویسید. از نام و سن کودک استفاده کنید. تشخیص بیماری ندهید. نشانه خطرناک را به پزشک ارجاع دهید. موضوع خارج از رشد کودک را مؤدبانه به رشد، غذا، خواب یا نگرانی برگردانید.'
                    },
                    {
                        role: 'user',
                        content: `زمینه کودک: ${JSON.stringify({
                            name: child && child.name,
                            gender: child && child.gender,
                            age_in_months: monthsOf(child),
                            context: context || {}
                        })}`
                    },
                    ...history
                ]
            })
        });
        if (!res.ok) return { reply: localReply, source: 'local' };
        const data = await res.json();
        const reply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        if (!reply) return { reply: localReply, source: 'local' };
        return { reply: String(reply).trim(), source: 'model' };
    } catch (_err) {
        return { reply: localReply, source: 'local' };
    }
}

async function analyzeConcernWithModel(child, concernText) {
    const apiKey = process.env.OPENAI_API_KEY || process.env.GROWTH_AI_KEY;
    if (!apiKey) return analyzeConcernLocal(child, concernText);
    const endpoint = process.env.GROWTH_AI_URL || 'https://api.openai.com/v1/chat/completions';
    const model = process.env.GROWTH_AI_MODEL || 'gpt-4o-mini';
    const payload = {
        model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
            {
                role: 'system',
                content: 'شما دستیار هوشمند ارزیابی رشد کودک تات‌کیدز هستید. فقط JSON معتبر برگردانید. لحن آرام، علمی و بدون برچسب‌زنی. در red flag فوری به پزشک ارجاع دهید.'
            },
            {
                role: 'user',
                content: JSON.stringify({
                    child_info: {
                        name: child.name,
                        gender: child.gender,
                        age_in_months: monthsOf(child),
                        age_bracket: child.age_bracket || child.ageBand || ''
                    },
                    parent_concern: concernText
                })
            }
        ]
    };
    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });
        if (!res.ok) return analyzeConcernLocal(child, concernText);
        const data = await res.json();
        const raw = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.triage_status || !parsed.status_badge) {
            return analyzeConcernLocal(child, concernText);
        }
        return parsed;
    } catch (_err) {
        return analyzeConcernLocal(child, concernText);
    }
}

module.exports = {
    TRIAGE,
    analyzeConcernLocal,
    analyzeConcernWithModel,
    classifyChatIntent,
    chatGrowthAssistantLocal,
    chatGrowthAssistant
};
