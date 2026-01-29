import express from 'express';
import cors from 'cors';
import connectDB from './src/config/database.js';
import config from './src/config/config.js';

// Import routes
import authRoutes from './src/routes/auth.routes.js';
import formRoutes from './src/routes/form.routes.js';
import customerRoutes from './src/routes/customer.routes.js';
import leadRoutes from './src/routes/lead.routes.js';

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Customer Engagement Agent API',
    status: 'running',
    version: '1.0.0',
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'connected',
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/leads', leadRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`💻 Frontend URL: ${config.frontendUrl}`);
  console.log('\n✨ Ready to accept requests!\n');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

export default app;