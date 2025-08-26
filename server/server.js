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

let users, children, growthData, medicalVisits, medicalDocuments, checkups, reminders, childIdCounter;

const loadData = () => {
    if (fs.existsSync(dbPath)) {
        const rawData = fs.readFileSync(dbPath);
        const data = JSON.parse(rawData);
        users = data.users;
        children = data.children.map(child => ({
            ...child,
            vaccinationRecords: child.vaccinationRecords || {} // Ensure property exists
        }));
        growthData = data.growthData;
        medicalVisits = data.medicalVisits;
        medicalDocuments = data.medicalDocuments;
        checkups = data.checkups || {};
        reminders = data.reminders || {};
        childIdCounter = data.childIdCounter;
    } else {
        users = {};
        children = [];
        growthData = {};
        medicalVisits = {};
        medicalDocuments = {};
        checkups = {};
        reminders = {};
        childIdCounter = 1;
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
        childIdCounter
    }, null, 2);
    fs.writeFileSync(dbPath, data);
};

function calculateAge(birthDate) { /* ... */ }

// --- API Routes ---
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

    const key = `${vaccineName}-${dose}`;
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
    const { childId } = req.params;
    const child = children.find(c => c.id === parseInt(childId));
    if (!child) return res.status(404).json({ message: 'Child not found' });

    const allReminders = [];
    const ageInMonths = (new Date() - new Date(child.birthDate)) / (1000 * 60 * 60 * 24 * 30.4375);
    const records = child.vaccinationRecords || {};

    // 1. Generate Vaccine Reminders
    vaccinationSchedule.forEach(vaccine => {
        const key = `${vaccine.name}-${vaccine.dose}`;
        const isDone = records[key] && records[key].done;

        if (isDone) return; // Skip completed vaccines

        let status = '';
        let type = '';

        if (ageInMonths > vaccine.month) {
            status = `این واکسن دیر شده است (موعد: ${vaccine.month} ماهگی)`;
            type = 'danger';
        } else if (ageInMonths >= vaccine.month - 1) {
            status = `موعد این واکسن نزدیک است (در ${vaccine.month} ماهگی)`;
            type = 'warning';
        } else {
            return; // Skip future vaccines that are not yet upcoming
        }

        allReminders.push({
            id: `vaccine-${child.id}-${key}`,
            type: type,
            title: `واکسن: ${vaccine.name} (دوز ${vaccine.dose})`,
            message: status,
            source: 'auto',
            link: `/vaccination/${child.id}`
        });
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
        res.json({ message: 'Login successful!', user: { id: user.id, username: user.username, email: user.email } });
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