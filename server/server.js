const express = require('express');
const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const router = jsonServer.router('server/db.json');
const middlewares = jsonServer.defaults({
    static: 'public'
});

// Clé de chiffrement des tokens
const SECRET_KEY = '+EPRzqrcfCtw/GNO1CVUodjcvVDYmspLjFqiXvKC3FQWoZXCBGt+0akV+5uyKNuF';

app.use(express.json());
app.use(middlewares);

// --------------------------------------------------------------------------

// Route register
app.post('/auth/register', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const users = router.db.get('users');
    const user = users.find({ email }).value();
    
    if (user) {
        return res.status(400).json({ error: 'User already exists' });
    }

    users.push({
        id: Date.now(),
        email,
        password: hashedPassword
    }).write();

    res.status(201).json({ message: 'User created successfully' });
});

// --------------------------------------------------------------------------

// Route login
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = router.db.get('users').find({ email }).value();

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, SECRET_KEY);
    res.json({ token });
});

// --------------------------------------------------------------------------

// Protection de l'api avec vérification du token
app.use('/api', (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// --------------------------------------------------------------------------

// Get id du user via le token
const getUserId = (req) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        return decoded.id;
    } catch (err) {
        return null;
    }
};

// --------------------------------------------------------------------------

// Route objectifs

// GET
app.get('/api/goals', (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const goals = router.db
        .get('goals')
        .filter(goal => goal.userId === userId)
        .value();
    res.json(goals);
});

// POST
app.post('/api/goals', (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const goal = { ...req.body, userId };
    const goals = router.db.get('goals');
    goals.push(goal).write();
    res.json(goal);
});

// --------------------------------------------------------------------------

// Route repas

// GET
app.get('/api/meals', (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const meals = router.db
        .get('meals')
        .filter(meal => meal.userId === userId)
        .value();
    res.json(meals);
});

// POST
app.post('/api/meals', (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const meal = { ...req.body, userId };
    const meals = router.db.get('meals');
    meals.push(meal).write();
    res.json(meal);
});

// --------------------------------------------------------------------------

// Route calcul progress avec repas par users
app.get('/api/dailyProgress', (req, res) => {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const meals = router.db
        .get('meals')
        .filter(meal => meal.userId === userId)
        .value();
    const progress = calculateDailyProgress(meals);
    res.json(progress);
});

// --------------------------------------------------------------------------

app.use('/api', router);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});