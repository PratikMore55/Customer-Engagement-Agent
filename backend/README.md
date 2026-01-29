# Customer Engagement Agent - Backend API

AI-powered customer classification and engagement system using Claude AI (Mock version for free development).

## 🚀 Features

- **AI Lead Classification**: Automatically classifies customers as Hot, Normal, or Cold leads
- **Personalized Emails**: Generates and sends customized emails based on lead classification
- **Custom Forms**: Create dynamic forms with various field types
- **Lead Management**: Track, update, and manage leads through their lifecycle
- **Follow-up Tracking**: Never miss a follow-up with automated reminders
- **Analytics**: Get insights on lead distribution and conversion rates

## 📋 Tech Stack

- **Node.js** + **Express.js** - Backend framework
- **MongoDB** - Database
- **Mock AI Service** - Simulates Claude AI (FREE for development)
- **JWT** - Authentication
- **Nodemailer** - Email sending
- **Bcrypt** - Password hashing

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update with your values:
     ```env
     PORT=5000
     MONGODB_URI=your-mongodb-connection-string
     JWT_SECRET=your-secret-key
     EMAIL_USER=your-email@gmail.com
     EMAIL_PASSWORD=your-app-password
     ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - Login user
GET    /api/auth/me             - Get current user (Protected)
PUT    /api/auth/profile        - Update profile (Protected)
PUT    /api/auth/change-password - Change password (Protected)
```

### Forms
```
POST   /api/forms               - Create form (Protected)
GET    /api/forms               - Get all forms (Protected)
GET    /api/forms/:id           - Get single form (Protected)
GET    /api/forms/public/:id    - Get public form (Public)
PUT    /api/forms/:id           - Update form (Protected)
DELETE /api/forms/:id           - Delete form (Protected)
PATCH  /api/forms/:id/toggle    - Toggle active status (Protected)
```

### Customers
```
POST   /api/customers/submit    - Submit form (Public) ⭐ AI processes here!
GET    /api/customers           - Get all customers (Protected)
GET    /api/customers/:id       - Get single customer (Protected)
DELETE /api/customers/:id       - Delete customer (Protected)
```

### Leads
```
GET    /api/leads                        - Get all leads (Protected)
GET    /api/leads/stats                  - Get statistics (Protected)
GET    /api/leads/due-follow-up          - Get due follow-ups (Protected)
GET    /api/leads/:id                    - Get single lead (Protected)
PATCH  /api/leads/:id/classification     - Update classification (Protected)
PATCH  /api/leads/:id/follow-up          - Update follow-up status (Protected)
POST   /api/leads/:id/notes              - Add note (Protected)
PATCH  /api/leads/:id/convert            - Mark as converted (Protected)
```

## 🤖 How AI Classification Works

When a customer submits a form via `/api/customers/submit`:

1. **Submission Saved** - Customer data stored in database
2. **Background Processing Starts** - Async AI classification
3. **AI Analyzes** - Mock AI examines responses and context
4. **Classification** - Assigns Hot/Normal/Cold with confidence score
5. **Lead Created** - Lead record with insights saved
6. **Email Generated** - Personalized email created based on classification
7. **Email Sent** - Automated email sent to customer

### Classification Logic (Mock AI)

**Hot Lead (0.7-1.0):**
- Keywords: "urgent", "immediate", "budget"
- Strong buying signals
- Clear timeline
- Decision-making authority

**Normal Lead (0.3-0.7):**
- Moderate interest
- Some qualification signals
- Defined timeline
- Budget mentioned

**Cold Lead (0.0-0.3):**
- Early research phase
- No urgency
- Limited budget signals
- Long timeline

## 🎨 Mock AI Service

The system currently uses a **Mock AI Service** that simulates Claude API responses:

- ✅ **100% FREE** - No API keys needed
- ✅ **Realistic behavior** - Simulates delays and responses
- ✅ **Smart classification** - Uses keyword detection
- ✅ **Perfect for development** - Test everything without costs

### Switching to Real Claude AI

When ready to use real Claude AI:

1. Get API key from https://console.anthropic.com/
2. Add to `.env`: `ANTHROPIC_API_KEY=sk-ant-your-key`
3. Replace `src/services/ai.service.js` with the real version
4. Restart server

That's it! No other changes needed.

## 📧 Email Configuration

### Using Gmail

1. Enable 2-factor authentication on your Google account
2. Generate an "App Password": https://myaccount.google.com/apppasswords
3. Add to `.env`:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```

## 🗄️ Database Models

### User
- Business owner account
- Stores business information
- Manages authentication

### Form
- Custom form builder
- Dynamic field configuration
- Classification criteria
- Email templates

### Customer
- Form submissions
- Dynamic responses
- Processing status

### Lead
- AI classification result
- Hot/Normal/Cold status
- Insights and reasoning
- Email tracking
- Follow-up management
- Conversion tracking

## 🔒 Security

- Passwords hashed with bcrypt
- JWT token authentication
- Input validation on all routes
- XSS protection
- MongoDB injection prevention
- CORS configuration

## 📊 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── config.js           - Configuration
│   │   └── database.js         - MongoDB connection
│   ├── models/
│   │   ├── User.model.js       - User schema
│   │   ├── Form.model.js       - Form schema
│   │   ├── Customer.model.js   - Customer schema
│   │   └── Lead.model.js       - Lead schema
│   ├── controllers/
│   │   ├── auth.controller.js      - Auth logic
│   │   ├── form.controller.js      - Form logic
│   │   ├── customer.controller.js  - Customer logic
│   │   └── lead.controller.js      - Lead logic
│   ├── services/
│   │   ├── ai.service.js           - AI integration (Mock)
│   │   ├── classification.service.js - Classification logic
│   │   └── email.service.js        - Email generation & sending
│   ├── middleware/
│   │   ├── auth.middleware.js      - JWT verification
│   │   └── validation.middleware.js - Input validation
│   ├── routes/
│   │   ├── auth.routes.js          - Auth endpoints
│   │   ├── form.routes.js          - Form endpoints
│   │   ├── customer.routes.js      - Customer endpoints
│   │   └── lead.routes.js          - Lead endpoints
│   └── utils/
│       └── logger.js               - Logging utility
├── server.js                       - Main server file
├── package.json
└── .env
```

## 🐛 Debugging

Check logs for:
- `🤖` - AI processing
- `📧` - Email operations
- `✅` - Success messages
- `❌` - Errors
- `⚠️` - Warnings

## 📝 Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/customer-engagement-agent

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# Frontend
FRONTEND_URL=http://localhost:3000

# Classification Thresholds
HOT_LEAD_THRESHOLD=0.7
COLD_LEAD_THRESHOLD=0.3
```

## 🚀 Deployment

Ready for deployment to:
- Heroku
- Railway
- Render
- DigitalOcean
- AWS
- Vercel (serverless)

## 📄 License

ISC

## 🤝 Support

For issues or questions, please create an issue on GitHub.

---

Built with ❤️ using Node.js and AI