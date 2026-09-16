require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');
const notFound = require('./src/middleware/notFound');
const startExpiryCronJob = require('./src/jobs/expiryCheckJob');

const authRoutes = require('./src/routes/authRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const memberRoutes = require('./src/routes/memberRoutes');
const packageRoutes = require('./src/routes/packageRoutes');
const membershipRoutes = require('./src/routes/membershipRoutes');
const attendanceRoutes = require('./src/routes/attendanceRoutes');
const trainerRoutes = require('./src/routes/trainerRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const leadRoutes = require('./src/routes/leadRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const whatsappRoutes = require('./src/routes/whatsappRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');

const app = express();

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
| Allow requests from any device/origin.
*/
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

/*
|--------------------------------------------------------------------------
| Body Parser
|--------------------------------------------------------------------------
*/
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Gym Management CRM API is running',
  });
});

app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/members', memberRoutes);
app.use('/api/v1/packages', packageRoutes);
app.use('/api/v1/memberships', membershipRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/trainers', trainerRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/whatsapp', whatsappRoutes);
app.use('/api/v1/settings', settingsRoutes);

/*
|--------------------------------------------------------------------------
| 404 + Error Handler
|--------------------------------------------------------------------------
*/
app.use(notFound);
app.use(errorHandler);

/*
|--------------------------------------------------------------------------
| Server
|--------------------------------------------------------------------------
*/
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(
        `Gym CRM server running in ${process.env.NODE_ENV || 'development'
        } mode on port ${PORT}`
      );

      startExpiryCronJob();
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;