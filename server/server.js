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
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({ destination: (req, file, cb) => cb(null, uploadsDir), filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)) });
const upload = multer({ storage: storage });

const dbPath = path.join(__dirname, 'db.json');

let users, children, growthData, medicalVisits, medicalDocuments, checkups, reminders, childIdCounter, banners, articles, news, tickets;

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
        tickets
    }, null, 2);
    fs.writeFileSync(dbPath, data);
};

function calculateAge(birthDate) { /* ... */ }

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

// --- API Routes ---

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

// --- Content Management Routes ---
app.get('/api/banners', (req, res) => {
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
    const { title, content, summary } = req.body;
    const newArticle = {
        id: Date.now(),
        title,
        summary,
        content,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
        createdAt: new Date().toISOString()
    };
    news.unshift(newArticle); // Add to the beginning
    saveData();
    res.status(201).json(newArticle);
});

app.put('/api/admin/news/:id', isAdmin, upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { title, content, summary } = req.body;
    const articleIndex = news.findIndex(n => n.id === parseInt(id));

    if (articleIndex === -1) {
        return res.status(404).json({ message: 'مقاله یافت نشد' });
    }

    const updatedArticle = {
        ...news[articleIndex],
        title,
        summary,
        content,
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

// --- Ticketing System Routes ---
app.get('/api/admin/tickets', isAdmin, (req, res) => {
    res.json(tickets);
});

app.get('/api/admin/tickets/:id', isAdmin, (req, res) => {
    const ticket = tickets.find(t => t.id === parseInt(req.params.id));
    if (ticket) {
        res.json(ticket);
    } else {
        res.status(404).json({ message: 'تیکت یافت نشد' });
    }
});

app.put('/api/admin/tickets/:id', isAdmin, (req, res) => {
    const { id } = req.params;
    const { status, reply } = req.body;
    const ticketIndex = tickets.findIndex(t => t.id === parseInt(id));

    if (ticketIndex === -1) {
        return res.status(404).json({ message: 'تیکت یافت نشد' });
    }

    const ticket = tickets[ticketIndex];
    if (status) {
        ticket.status = status;
    }
    if (reply) {
        ticket.replies = ticket.replies || [];
        ticket.replies.push({
            userId: req.headers['x-user-id'], // Admin user ID
            content: reply,
            createdAt: new Date().toISOString()
        });
        ticket.status = 'answered'; // Automatically update status
    }
    ticket.updatedAt = new Date().toISOString();

    tickets[ticketIndex] = ticket;
    saveData();
    res.json(ticket);
});

// --- Reporting/Stats Route ---
app.get('/api/admin/stats', isAdmin, (req, res) => {
    const stats = {
        totalUsers: Object.keys(users).length,
        totalChildren: children.length,
        totalBanners: banners.length,
        totalArticles: news.length,
        totalTickets: tickets.length,
        openTickets: tickets.filter(t => t.status === 'open').length
    };
    res.json(stats);
});


app.post('/api/upload', upload.single('avatar'), (req, res) => { if (!req.file) return res.status(400).json({ message: 'No file' }); res.json({ filePath: `/uploads/${req.file.filename}` }); });

app.post('/api/children', (req, res) => {
    const { userId, firstName, lastName, gender, birthDate, avatar, ...otherData } = req.body;
    if (!firstName || !lastName) return res.status(400).json({ message: 'Name required' });
    const newChild = {
        id: childIdCounter++,
        userId: parseInt(userId), // Add userId
        name: `${firstName} ${lastName}`,
        gender,
        birthDate,
        age: calculateAge(birthDate),
        avatar: avatar || 'https://i.pravatar.cc/100',
        ...otherData,
        vaccinationRecords: {},
    };
    children.push(newChild);
    if(otherData.height && otherData.weight) { growthData[newChild.id] = [{ date: birthDate, height: parseFloat(otherData.height), weight: parseFloat(otherData.weight) }]; }
    medicalVisits[newChild.id] = [];
    medicalDocuments[newChild.id] = [];
    checkups[newChild.id] = [];
    saveData();
    res.status(201).json(newChild);
});

app.get('/api/children', (req, res) => res.json(children));
app.get('/api/children/:id', (req, res) => {
    const childId = parseInt(req.params.id);
    const child = children.find(c => c.id === childId);
    if (child) {
        const childWithGrowthData = {
            ...child,
            growthData: growthData[childId] || []
        };
        res.json(childWithGrowthData);
    } else {
        res.status(404).json({ message: 'Not found' });
    }
});

app.put('/api/children/:id', (req, res) => {
    const childIndex = children.findIndex(c => c.id === parseInt(req.params.id));
    if (childIndex > -1) {
        const { ...finalData } = req.body;
        // Ensure name is correctly reconstructed if firstName/lastName are provided
        if (finalData.firstName && finalData.lastName) {
            finalData.name = `${finalData.firstName} ${finalData.lastName}`.trim();
        }
        children[childIndex] = { ...children[childIndex], ...finalData, age: calculateAge(finalData.birthDate) };
        saveData();
        res.status(200).json(children[childIndex]);
    } else { res.status(404).json({ message: 'Not found' }); }
});

app.delete('/api/children/:id', (req, res) => { const childId = parseInt(req.params.id); const initialLength = children.length; children = children.filter(c => c.id !== childId); if (growthData[childId]) delete growthData[childId]; if (medicalVisits[childId]) delete medicalVisits[childId]; if (children.length < initialLength) { saveData(); res.status(200).json({ message: 'Deleted' }); } else res.status(404).json({ message: 'Not found' }); });

app.get('/api/growth/:childId', (req, res) => res.json(growthData[req.params.childId] || []));
app.post('/api/growth/:childId', (req, res) => {
    const { childId } = req.params;
    const { date, height, weight, headCircumference } = req.body;
    if (!date || (!height && !weight && !headCircumference)) {
        return res.status(400).json({ message: 'Date and at least one measurement are required.' });
    }
    if (!growthData[childId]) {
        growthData[childId] = [];
    }
    const newRecord = {
        date,
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        headCircumference: headCircumference ? parseFloat(headCircumference) : undefined
    };
    growthData[childId].push(newRecord);
    growthData[childId].sort((a, b) => new Date(a.date.replace(/\//g, '-')) - new Date(b.date.replace(/\//g, '-')));
    saveData();
    res.status(201).json(newRecord);
});
app.delete('/api/growth/:childId/:date', (req, res) => { const { childId, date } = req.params; if (growthData[childId]) { const initialLength = growthData[childId].length; growthData[childId] = growthData[childId].filter(record => record.date !== date); if (growthData[childId].length < initialLength) { saveData(); res.status(200).json({ message: 'Record deleted' }); } else res.status(404).json({ message: 'Record not found' }); } else res.status(404).json({ message: 'Child not found' }); });

app.get('/api/vaccination-status/:childId', (req, res) => {
    const { childId } = req.params;
    const child = children.find(c => c.id === parseInt(childId));
    if (!child) return res.status(404).json({ message: 'Child not found' });

    const ageInMonths = (new Date() - new Date(child.birthDate)) / (1000 * 60 * 60 * 24 * 30.4375);
    const records = child.vaccinationRecords || {};

    const status = vaccinationSchedule.map(vaccine => {
        const key = `${vaccine.name}-${vaccine.dose}`;
        const isDone = records[key] && records[key].done;
        let status = 'upcoming';
        if (isDone) {
            status = 'done';
        } else if (ageInMonths > vaccine.month + 2) { // 2 months grace period
            status = 'overdue';
        } else if (ageInMonths < vaccine.month) {
            status = 'future';
        }
        return { ...vaccine, status, administeredDate: records[key] ? records[key].date : null };
    });

    res.json(status);
});

app.post('/api/vaccinate/:childId', (req, res) => {
    const { childId } = req.params;
    const { vaccineName, dose, date } = req.body;
    const child = children.find(c => c.id === parseInt(childId));
    if (!child) return res.status(404).json({ message: 'Child not found' });

    if (!child.vaccinationRecords) {
        child.vaccinationRecords = {};
    }

    const key = `${vaccine.name}-${dose}`;
    child.vaccinationRecords[key] = { done: true, date: date || new Date().toISOString().split('T')[0] };
    saveData();
    res.status(200).json({ message: 'Vaccination record updated' });
});

app.get('/api/visits/:childId', (req, res) => res.json(medicalVisits[req.params.childId] || []));
app.post('/api/visits/:childId', (req, res) => { const { childId } = req.params; const { date, doctorName, reason, summary } = req.body; if (!date || !doctorName || !reason) return res.status(400).json({ message: 'All fields required' }); if (!medicalVisits[childId]) medicalVisits[childId] = []; const newVisit = { date, doctorName, reason, summary }; medicalVisits[childId].push(newVisit); medicalVisits[childId].sort((a, b) => new Date(b.date.replace(/\//g, '-')) - new Date(a.date.replace(/\//g, '-'))); saveData(); res.status(201).json(newVisit); });

app.get('/api/checkups/:childId', (req, res) => {
    const { childId } = req.params;
    res.json(checkups[childId] || []);
});

app.post('/api/checkups/:childId', upload.single('checkupFile'), (req, res) => {
    const { childId } = req.params;
    const { title, date, parameters } = req.body;

    if (!title || !date || !parameters) {
        return res.status(400).json({ message: 'Title, date, and parameters are required.' });
    }

    if (!checkups[childId]) {
        checkups[childId] = [];
    }

    const newCheckup = {
        id: Date.now(),
        title,
        date,
        parameters: JSON.parse(parameters),
        fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
    };

    checkups[childId].push(newCheckup);
    checkups[childId].sort((a, b) => new Date(b.date) - new Date(a.date));
    saveData();
    res.status(201).json(newCheckup);
});

app.post('/api/documents/:childId', upload.single('document'), (req, res) => {
    const { childId } = req.params;
    const { title } = req.body;
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
    if (!medicalDocuments[childId]) medicalDocuments[childId] = [];
    const newDocument = { title: title || req.file.originalname, filePath: `/uploads/${req.file.filename}`, uploadDate: new Date().toISOString().split('T')[0].replace(/-/g, '/') };
    medicalDocuments[childId].push(newDocument);
    saveData();
    res.status(201).json(newDocument);
});
app.get('/api/documents/:childId', (req, res) => res.json(medicalDocuments[req.params.childId] || []));

// --- Reminder Endpoints ---

app.get('/api/reminders/all/:childId', (req, res) => {
    console.log(`--- Generating Reminders for Child ID: ${req.params.childId} ---`);
    const { childId } = req.params;
    const child = children.find(c => c.id === parseInt(childId));

    if (!child) {
        console.log("[DEBUG] Child not found.");
        return res.status(404).json({ message: 'Child not found' });
    }
    console.log(`[DEBUG] Found child: ${child.name}, Birthdate: ${child.birthDate}`);

    const allReminders = [];
    const birthDate = new Date(child.birthDate.replace(/\//g, '-'));
    const ageInMonths = (new Date() - birthDate) / (1000 * 60 * 60 * 24 * 30.4375);
    console.log(`[DEBUG] Calculated Age: ${ageInMonths.toFixed(2)} months`);

    const records = child.vaccinationRecords || {};
    console.log('[DEBUG] Vaccination Records:', JSON.stringify(records));

    // 1. Generate Vaccine Reminders
    console.log("--- Checking Vaccine Schedule ---");
    vaccinationSchedule.forEach(vaccine => {
        const key = `${vaccine.name}-${vaccine.dose}`;
        const isDone = records[key] && records[key].done;

        console.log(`[DEBUG] Checking Vaccine: ${key}`);
        console.log(`  - Due at: ${vaccine.month} months`);
        console.log(`  - Is Done? ${isDone}`);

        if (isDone) {
            console.log("  - SKIPPING: Already done.");
            return;
        }

        let status = '';
        let type = '';

        if (ageInMonths > vaccine.month) {
            status = `این واکسن دیر شده است (موعد: ${vaccine.month} ماهگی)`;
            type = 'danger';
            console.log(`  - STATUS: Overdue. (Age: ${ageInMonths.toFixed(2)} > Due: ${vaccine.month})`);
        } else if (ageInMonths >= vaccine.month - 1) {
            status = `موعد این واکسن نزدیک است (در ${vaccine.month} ماهگی)`;
            type = 'warning';
            console.log(`  - STATUS: Upcoming. (Age: ${ageInMonths.toFixed(2)} >= Due-1: ${vaccine.month - 1})`);
        } else {
            console.log("  - SKIPPING: Too far in the future.");
            return;
        }

        const reminder = {
            id: `vaccine-${child.id}-${key}`,
            type: type,
            title: `واکسن: ${vaccine.name} (دوز ${vaccine.dose})`,
            message: status,
            source: 'auto',
            link: `/vaccination/${child.id}`
        };
        allReminders.push(reminder);
        console.log("  - PUSHED REMINDER:", JSON.stringify(reminder));
    });

    // 2. Generate Lab Test Reminders (Simplified)
    const checkupHistory = checkups[childId] || [];
    Object.entries(recommendedCheckupsData).forEach(([ageGroup, recommendations]) => {
        const [minAge, maxAge] = ageGroup.split('-').map(Number);
        if (ageInMonths >= minAge && ageInMonths <= maxAge) {
            recommendations.forEach(rec => {
                // A simple check: does any checkup title contain the recommendation?
                const isDone = checkupHistory.some(c => c.title.includes(rec.split(' ')[1]));
                if (!isDone) {
                    allReminders.push({
                        id: `checkup-${child.id}-${rec.replace(/\s/g, '-')}`,
                        type: 'info',
                        title: 'توصیه چکاپ',
                        message: rec,
                        source: 'auto',
                        link: `/lab-tests/${child.id}` // Add link for checkup reminders
                    });
                }
            });
        }
    });
    
    // 3. Add Manual Reminders
    const manualReminders = reminders[childId] || [];
    allReminders.push(...manualReminders);


    res.json(allReminders);
});

app.post('/api/reminders/manual/:childId', (req, res) => {
    const { childId } = req.params;
    const { title, date, type = 'custom' } = req.body;

    if (!title || !date) {
        return res.status(400).json({ message: 'Title and date are required.' });
    }

    if (!reminders[childId]) {
        reminders[childId] = [];
    }

    const newReminder = {
        id: `manual-${Date.now()}`,
        type: type,
        title: title,
        message: `یادآور سفارشی در تاریخ: ${date}`,
        date: date,
        source: 'manual'
    };
    
    reminders[childId].push(newReminder);
    saveData();
    res.status(201).json(newReminder);
});


app.get('/api/reminders/:userId', (req, res) => {
    const { userId } = req.params;
    res.json(reminders[userId] || []);
});

app.delete('/api/reminders/manual/:childId/:reminderId', (req, res) => {
    const { childId, reminderId } = req.params;
    if (reminders[childId]) {
        const initialLength = reminders[childId].length;
        reminders[childId] = reminders[childId].filter(r => r.id !== reminderId);
        if (reminders[childId].length < initialLength) {
            saveData();
            res.status(200).json({ message: 'Reminder dismissed' });
        } else {
            res.status(404).json({ message: 'Reminder not found' });
        }
    } else {
        res.status(404).json({ message: 'No reminders found for this child' });
    }
});

app.post('/api/generate-reminders/:userId', (req, res) => {
    const { userId } = req.params;
    if (!reminders[userId]) {
        reminders[userId] = [];
    }

    // This is a simplified simulation of a cron job.
    // In a real app, this logic would run on a schedule.
    const userChildren = children.filter(c => c.userId === parseInt(userId)); // Assuming children have a userId

    userChildren.forEach(child => {
        const ageInMonths = (new Date() - new Date(child.birthDate)) / (1000 * 60 * 60 * 24 * 30.4375);

        // Check for upcoming vaccines
        vaccinationSchedule.forEach(vaccine => {
            const reminderId = `vaccine-${child.id}-${vaccine.name}-${vaccine.dose}`;
            const alreadyExists = reminders[userId].some(r => r.id === reminderId);
            if (alreadyExists) return;

            const isDone = child.vaccinationRecords && child.vaccinationRecords[`${vaccine.name}-${vaccine.dose}`];
            const isDue = ageInMonths >= vaccine.month - 1 && ageInMonths < vaccine.month + 2;

            if (!isDone && isDue) {
                reminders[userId].push({
                    id: reminderId,
                    type: 'vaccine',
                    message: `واکسن ${vaccine.name} (دوز ${vaccine.dose}) برای ${child.name} به زودی فرا می‌رسد.`,
                    date: new Date(),
                });
            }
        });
    });

    saveData();
    res.status(201).json({ message: 'Reminders generated' });
});

app.get('/api/recommended-tests/:childId', (req, res) => {
    const { childId } = req.params;
    const child = children.find(c => c.id === parseInt(childId));
    if (!child) return res.status(404).json({ message: 'Child not found' });

    const ageInMonths = (new Date() - new Date(child.birthDate)) / (1000 * 60 * 60 * 24 * 30.4375);

    let ageGroup = '24-60';
    if (ageInMonths <= 6) ageGroup = '0-6';
    else if (ageInMonths <= 12) ageGroup = '6-12';
    else if (ageInMonths <= 24) ageGroup = '12-24';

    const recommendations = recommendedCheckupsData[ageGroup] || [];
    res.json(recommendations);
});


app.get('/api/backup', (req, res) => {
    const backupData = {
        users,
        children,
        growthData,
        medicalVisits,
        medicalDocuments,
        childIdCounter
    };
    res.json(backupData);
});

app.get('/api/stats', (req, res) => {
    const totalChildren = children.length;
    const averageAge = children.reduce((acc, child) => acc + child.age, 0) / (totalChildren || 1);
    res.json({ totalChildren, averageAge: averageAge.toFixed(1) });
});

app.post('/api/restore', (req, res) => {
    const {
        users: restoredUsers,
        children: restoredChildren,
        growthData: restoredGrowthData,
        medicalVisits: restoredMedicalVisits,
        medicalDocuments: restoredMedicalDocuments,
        childIdCounter: restoredChildIdCounter
    } = req.body;

    users = restoredUsers || {};
    children = restoredChildren || [];
    growthData = restoredGrowthData || {};
    medicalVisits = restoredMedicalVisits || {};
    medicalDocuments = restoredMedicalDocuments || {};
    childIdCounter = restoredChildIdCounter || 1;

    saveData();
    res.status(200).json({ message: 'Data restored successfully' });
});

app.get('/api/users/:id', (req, res) => {
    const user = users[req.params.id];
    if (user) {
        // Ensure we don't send the password back
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } else {
        res.status(404).json({ message: 'کاربر یافت نشد' });
    }
});

app.put('/api/users/:id/password', (req, res) => {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    const user = users[id];

    if (!user || user.password !== currentPassword) {
        return res.status(401).json({ message: 'رمز عبور فعلی اشتباه است' });
    }

    users[id].password = newPassword;
    saveData();
    res.status(200).json({ message: 'رمز عبور با موفقیت تغییر کرد' });
});

app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    console.log(`[Update Profile] Received request for user ID: ${id}`);
    console.log('[Update Profile] Request body:', req.body);
    const { firstName, lastName, birthDate, province, city, mobile, email } = req.body;
    if (users[id]) {
        users[id] = { ...users[id], firstName, lastName, birthDate, province, city, mobile, email };
        saveData();
        console.log(`[Update Profile] User ${id} updated. New data:`, users[id]);
        // Log the content of db.json after saving
        const dbContent = fs.readFileSync(dbPath, 'utf8');
        console.log('[Update Profile] db.json content after save:', dbContent);
        res.json({ message: 'اطلاعات با موفقیت به‌روز شد', user: users[id] });
    } else {
        console.log(`[Update Profile] User with ID ${id} not found.`);
        res.status(404).json({ message: 'کاربر یافت نشد' });
    }
});

app.post('/api/login', (req, res) => {
    const { login, password } = req.body;
    console.log(`[Login Attempt] User: ${login}`);
    const user = Object.values(users).find(u => (u.username === login || u.email === login) && u.password === password);
    if (user) {
        console.log(`[Login Success] User found:`, user);
        const { password, ...userWithoutPassword } = user;
        res.json({ message: 'Login successful!', user: userWithoutPassword });
    } else {
        console.log(`[Login Failure] User not found or password incorrect.`);
        res.status(401).json({ message: 'اطلاعات ورود نادرست است' });
    }
});

app.post('/api/signup', (req, res) => {
    const { login, password } = req.body;
    if (!login || !password) {
        return res.status(400).json({ message: 'نام کاربری و رمز عبور الزامی است' });
    }
    const existingUser = Object.values(users).find(u => u.username === login || u.email === login);
    if (existingUser) {
        return res.status(409).json({ message: 'این نام کاربری یا ایمیل قبلاً ثبت شده است' });
    }
    const newId = Math.max(0, ...Object.keys(users).map(Number)) + 1;
    const newUser = {
        id: newId,
        username: login,
        email: login.includes('@') ? login : '',
        password: password
    };
    users[newId] = newUser;
    saveData();
    res.status(201).json({ message: 'ثبت‌نام با موفقیت انجام شد', user: { id: newUser.id, username: newUser.username, email: newUser.email } });
});

app.listen(port, () => console.log(`Roshdyar server is listening on port ${port}`));
