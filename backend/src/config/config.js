import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/customer-engagement-agent',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  
  // Claude AI
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  
  // Email
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
  },
  
  // SendGrid (alternative)
  sendGridApiKey: process.env.SENDGRID_API_KEY,
  
  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Lead Classification
  leadThresholds: {
    hot: parseFloat(process.env.HOT_LEAD_THRESHOLD) || 0.7,
    cold: parseFloat(process.env.COLD_LEAD_THRESHOLD) || 0.3,
  },
};

// Validate required environment variables
const validateConfig = () => {
  const required = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Warning: Missing environment variables: ${missing.join(', ')}`);
    console.warn('⚠️  Please check your .env file');
  }
  
  // Optional warning for API key (not required for mock)
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('ℹ️  Using mock AI service (no API key required)');
  }
};

validateConfig();

export default config;