const dotenv = require('dotenv')
const express = require('express');
const connectionDB = require('./config/db');
const cors = require('cors');

dotenv.config();
connectionDB();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 7000;

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/task', require('./routes/taskRoutes'));
app.use('/api/user', require('./routes/userRoutes'));

app.get('/', (req, res) => {
    res.send('Welcome to task management backend');
});

app.listen(PORT, () => {
    console.log(`Server is running  on port ${PORT}`);
});


