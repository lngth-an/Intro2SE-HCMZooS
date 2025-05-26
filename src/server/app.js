const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
// const { authenticateToken, requireTourist, requireProvider, requireAdmin, requireLogin, checkIfLoggedIn } = require('./src/middleware/authMiddleware');

const PORT = process.env.PORT || 3000;
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
}));

const activityRoutes = require('./src/routes/activityRoutes'); 
const semesterRoutes = require('./src/routes/semesterRoutes'); 

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(cookieParser());

app.use('/activity', activityRoutes);
app.use('/semester', semesterRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});