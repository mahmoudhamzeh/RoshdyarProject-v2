const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { vaccinationSchedule } = require('./vaccination-schedule');
const { recommendedCheckupsData } = require('./recommendations');

const app = express();
const port = process.env.PORT || 5000;

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) { fs.mkdirSync(uploadsDir, { recursive: true }); }

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(uploadsDir, { etag: false, lastModified: false }));

const storage = multer.diskStorage({ destination: (req, file, cb) => cb(null, uploadsDir), filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)) });
const upload = multer({ storage: storage });

const dbPath = path.join(__dirname, 'db.json');

let users, children, growthData, medicalVisits, medicalDocuments, checkups, reminders, childIdCounter, banners, articles, news, tickets, videos, podcasts;

const loadData = () => {
    if (fs.existsSync(dbPath)) {
        const rawData = fs.readFileSync(dbPath);
        const data = JSON.parse(rawData);
        users = data.users || {};
        children = (data.children || []).map(child => ({
            ...child,
            vaccinationRecords: child.vaccinationRecords || {} // Ensure property exists
        }));
        growthData = data.growthData || {};
        medicalVisits = data.medicalVisits || {};
        medicalDocuments = data.medicalDocuments || {};
        checkups = data.checkups || {};
        reminders = data.reminders || {};
        childIdCounter = data.childIdCounter || 1;
        banners = data.banners || [];
        articles = data.articles || [];
        news = data.news || [];
        tickets = data.tickets || [];
        videos = data.videos || [];
        podcasts = data.podcasts || [];
    } else {
        users = {};
        children = [];
        growthData = {};
        medicalVisits = {};
        medicalDocuments = {};
        checkups = {};
        reminders = {};
        childIdCounter = 1;
        banners = [];
        articles = [];
        news = [];
        tickets = [];
        videos = [];
        podcasts = [];
    }
};

loadData();

const saveData = () => {
    const data = JSON.stringify({
        users,
        children,
        growthData,
        medicalVisits,
        medicalDocuments,
        checkups,
        reminders,
        childIdCounter,
        banners,
        articles,
        news,
        tickets,
        videos,
        podcasts
    }, null, 2);
    fs.writeFileSync(dbPath, data);
};

function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

function calculateAgeInMonths(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let months = (today.getFullYear() - birth.getFullYear()) * 12;
    months -= birth.getMonth();
    months += today.getMonth();
    return months <= 0 ? 0 : months;
}

// --- API Routes ---

// --- Auth Routes ---
app.post('/api/login', (req, res) => {
    const { login, password } = req.body;
    const user = Object.values(users).find(u => (u.username === login || u.email === login) && u.password === password);

    if (user) {
        // In a real app, never send the password back
        const { password, ...userToSend } = user;
        res.status(200).json({ message: 'ورود موفقیت‌آمیز', user: userToSend });
    } else {
        res.status(401).json({ message: 'نام کاربری یا رمز عبور نامعتبر است' });
    }
});

// --- Children Routes ---
app.get('/api/children', (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        return res.status(401).json({ message: 'User ID is required' });
    }
    const userChildren = children.filter(c => c.userId === parseInt(userId));
    res.json(userChildren);
});

// --- Admin Middleware ---
const isAdmin = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        return res.status(401).json({ message: 'دسترسی غیرمجاز: شناسه کاربری ارائه نشده است' });
    }
    const user = users[userId];
    if (user && user.isAdmin) {
        next();
    } else {
        return res.status(403).json({ message: 'دسترسی غیرمجاز: شما مدیر نیستید' });
    }
};

// --- Admin Routes ---
app.get('/api/admin/users', isAdmin, (req, res) => {
    // Exclude passwords from the response
    const usersWithoutPasswords = Object.values(users).map(u => {
        const { password, ...user } = u;
        return user;
    });
    res.json(usersWithoutPasswords);
});

app.put('/api/admin/users/:id', isAdmin, (req, res) => {
    const { id } = req.params;
    const userData = req.body;

    if (!users[id]) {
        return res.status(404).json({ message: 'کاربر یافت نشد' });
    }

    // Prevent password from being updated through this endpoint
    delete userData.password;

    // Prevent an admin from removing their own admin status
    const requestingUserId = req.headers['x-user-id'];
    if (id === requestingUserId && users[id].isAdmin && !userData.isAdmin) {
        return res.status(400).json({ message: 'شما نمی‌توانید دسترسی ادمین خود را لغو کنید.' });
    }

    users[id] = { ...users[id], ...userData };
    saveData();

    const { password, ...updatedUser } = users[id];
    res.json(updatedUser);
});

app.delete('/api/admin/users/:id', isAdmin, (req, res) => {
    const { id } = req.params;

    if (!users[id]) {
        return res.status(404).json({ message: 'کاربر یافت نشد' });
    }

    // Prevent an admin from deleting themselves
    const requestingUserId = req.headers['x-user-id'];
    if (id === requestingUserId) {
        return res.status(400).json({ message: 'شما نمی‌توانید حساب کاربری خود را حذف کنید.' });
    }

    delete users[id];
    saveData();
    res.status(200).json({ message: 'کاربر با موفقیت حذف شد' });
});

app.get('/api/admin/users/:userId/children', isAdmin, (req, res) => {
    const { userId } = req.params;
    const userChildren = children.filter(c => c.userId === parseInt(userId));
    res.json(userChildren);
});

app.put('/api/admin/users/:id/set-password', isAdmin, (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!users[id]) {
        return res.status(404).json({ message: 'کاربر یافت نشد' });
    }

    if (!newPassword || newPassword.length < 4) {
        return res.status(400).json({ message: 'رمز عبور جدید باید حداقل ۴ کاراکتر باشد' });
    }

    users[id].password = newPassword;
    saveData();

    res.status(200).json({ message: 'رمز عبور کاربر با موفقیت تغییر کرد' });
});


// --- Content Management Routes ---
app.get('/api/banners', (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.json(banners);
});

app.post('/api/admin/banners', isAdmin, upload.single('image'), (req, res) => {
    const { title, link } = req.body;
    if (!req.file) {
        return res.status(400).json({ message: 'تصویر بنر الزامی است' });
    }
    const newBanner = {
        id: Date.now(),
        title,
        link,
        imageUrl: `/uploads/${req.file.filename}`
    };
    banners.push(newBanner);
    saveData();
    res.status(201).json(newBanner);
});

app.delete('/api/admin/banners/:id', isAdmin, (req, res) => {
    const { id } = req.params;
    const initialLength = banners.length;
    banners = banners.filter(b => b.id !== parseInt(id));
    if (banners.length < initialLength) {
        saveData();
        res.status(200).json({ message: 'بنر با موفقیت حذف شد' });
    } else {
        res.status(404).json({ message: 'بنر یافت نشد' });
    }
});

// News/Articles
app.get('/api/news', (req, res) => {
    res.json(news);
});

app.get('/api/news/:id', (req, res) => {
    const article = news.find(n => n.id === parseInt(req.params.id));
    if (article) {
        res.json(article);
    } else {
        res.status(404).json({ message: 'مقاله یافت نشد' });
    }
});

app.post('/api/admin/news', isAdmin, upload.single('image'), (req, res) => {
    const { title, content, summary, category } = req.body;
    const newArticle = {
        id: Date.now(),
        title,
        summary,
        content,
        category: category || 'عمومی', // Default category
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
        createdAt: new Date().toISOString()
    };
    news.unshift(newArticle); // Add to the beginning
    saveData();
    res.status(201).json(newArticle);
});

app.put('/api/admin/news/:id', isAdmin, upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { title, content, summary, category } = req.body;
    const articleIndex = news.findIndex(n => n.id === parseInt(id));

    if (articleIndex === -1) {
        return res.status(404).json({ message: 'مقاله یافت نشد' });
    }

    const updatedArticle = {
        ...news[articleIndex],
        title,
        summary,
        content,
        category: category || news[articleIndex].category,
        updatedAt: new Date().toISOString()
    };

    if (req.file) {
        updatedArticle.imageUrl = `/uploads/${req.file.filename}`;
    }

    news[articleIndex] = updatedArticle;
    saveData();
    res.json(updatedArticle);
});

app.delete('/api/admin/news/:id', isAdmin, (req, res) => {
    const { id } = req.params;
    const initialLength = news.length;
    news = news.filter(n => n.id !== parseInt(id));
    if (news.length < initialLength) {
        saveData();
        res.status(200).json({ message: 'مقاله با موفقیت حذف شد' });
    } else {
        res.status(404).json({ message: 'مقاله یافت نشد' });
    }
});

// Videos
app.get('/api/videos', (req, res) => {
    res.json(videos);
});

app.post('/api/admin/videos', isAdmin, (req, res) => {
    const { title, url, summary } = req.body;
    if (!title || !url) {
        return res.status(400).json({ message: 'Title and URL are required' });
    }
    const newVideo = {
        id: Date.now(),
        title,
        url,
        summary,
        createdAt: new Date().toISOString()
    };
    videos.unshift(newVideo);
    saveData();
    res.status(201).json(newVideo);
});

app.delete('/api/admin/videos/:id', isAdmin, (req, res) => {
    const { id } = req.params;
    const initialLength = videos.length;
    videos = videos.filter(v => v.id !== parseInt(id));
    if (videos.length < initialLength) {
        saveData();
        res.status(200).json({ message: 'ویدیو با موفقیت حذف شد' });
    } else {
        res.status(404).json({ message: 'ویدیو یافت نشد' });
    }
});

// Podcasts
app.get('/api/podcasts', (req, res) => {
    res.json(podcasts);
});

// --- Reminder Generation ---
const getOverdueVaccinationReminders = (child) => {
    const ageInMonths = calculateAgeInMonths(new Date(child.birthDate));
    const childVaccinations = child.vaccinationRecords || {};
    const reminders = [];

    vaccinationSchedule.forEach(group => {
        if (ageInMonths >= group.age) {
            group.vaccines.forEach(vaccine => {
                if (!childVaccinations[group.age] || !childVaccinations[group.age][vaccine.name]) {
                    reminders.push({
                        id: `vaccine-${child.id}-${group.age}-${vaccine.name}`,
                        title: `تأخیر در واکسن: ${vaccine.name}`,
                        message: `واکسن ${vaccine.name} (${group.label}) کودک شما به تأخیر افتاده است.`,
                        type: 'danger',
                        link: `/vaccination-status/${child.id}`,
                        source: 'auto'
                    });
                }
            });
        }
    });

    return reminders;
};

// --- Vaccination Routes ---
app.get('/api/vaccination-schedule', (req, res) => {
    res.json(vaccinationSchedule);
});

app.get('/api/children/:childId', (req, res) => {
    const { childId } = req.params;
    const child = children.find(c => c.id === parseInt(childId));
    if (child) {
        res.json(child);
    } else {
        res.status(404).json({ message: 'کودک یافت نشد' });
    }
});

app.put('/api/children/:childId/vaccination-records', (req, res) => {
    const { childId } = req.params;
    const { vaccinationRecords } = req.body;
    const childIndex = children.findIndex(c => c.id === parseInt(childId));

    if (childIndex !== -1) {
        children[childIndex].vaccinationRecords = vaccinationRecords;
        saveData();
        res.status(200).json(children[childIndex]);
    } else {
        res.status(404).json({ message: 'کودک یافت نشد' });
    }
});


// --- Reminder Routes ---
app.get('/api/reminders/all/:childId', (req, res) => {
    const { childId } = req.params;
    const child = children.find(c => c.id === parseInt(childId));

    if (!child) {
        return res.status(404).json({ message: 'کودک یافت نشد' });
    }

    const manualReminders = reminders[childId] || [];
    const autoReminders = getOverdueVaccinationReminders(child);

    res.json([...autoReminders, ...manualReminders]);
});

app.post('/api/reminders/manual/:childId', (req, res) => {
    const { childId } = req.params;
    const { title, date } = req.body;

    if (!title || !date) {
        return res.status(400).json({ message: 'عنوان و تاریخ الزامی است' });
    }

    if (!reminders[childId]) {
        reminders[childId] = [];
    }

    const newReminder = {
        id: `manual-${Date.now()}`,
        title,
        message: `یادآوری برای تاریخ: ${new Date(date).toLocaleDateString('fa-IR')}`,
        date,
        type: 'info',
        source: 'manual'
    };

    reminders[childId].push(newReminder);
    saveData();
    res.status(201).json(newReminder);
});

app.delete('/api/reminders/manual/:childId/:reminderId', (req, res) => {
    const { childId, reminderId } = req.params;

    if (!reminders[childId]) {
        return res.status(404).json({ message: 'هیچ یادآوری برای این کودک یافت نشد' });
    }

    const initialLength = reminders[childId].length;
    reminders[childId] = reminders[childId].filter(r => r.id !== reminderId);

    if (reminders[childId].length < initialLength) {
        saveData();
        res.status(200).json({ message: 'یادآوری با موفقیت حذف شد' });
    } else {
        res.status(404).json({ message: 'یادآوری مشخص شده یافت نشد' });
    }
});

app.listen(port, () => {
    console.log(`Roshdyar server is listening on port ${port}`);
});
