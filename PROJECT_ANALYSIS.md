# NaijaPay - Complete Project Analysis

## 1. Project Overview

**NaijaPay** is a full-stack fintech web application that enables receiving USA payments in Nigeria through assigned payment credentials (Cash App tags, Zelle details, Chime details, Apple Pay, PayPal, etc.).

**Repository**: https://github.com/peterchase-code/Naijapay.git  
**Author**: peterchase-code  
**License**: MIT  
**Language Split**: JavaScript 51.1%, HTML 33.4%, CSS 15.5%

---

## 2. Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - CSS Variables, Flexbox, CSS Grid, Animations
- **Vanilla JavaScript** - No frameworks (pure JS)
- **Font Awesome Icons** - UI icons
- **Google Fonts (Inter)** - Typography

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (with Mongoose ODM)
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing (salt rounds: 12)
- **Nodemailer** - Email service
- **Multer** - File upload handling

### Security Stack
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **express-mongo-sanitize** - NoSQL injection prevention
- **xss-clean** - XSS attack prevention
- **hpp** - HTTP Parameter Pollution prevention
- **express-rate-limit** - Rate limiting (20 auth req/15min, 100 API req/15min)

---

## 3. Project Structure

```
Naijapay/
├── backend/
│   ├── server.js                 # Entry point (100 lines)
│   ├── package.json              # Dependencies
│   ├── .env                      # Environment variables (CREATED)
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   ├── jwt.js                # JWT helpers (sign/verify)
│   │   ├── mail.js               # Nodemailer SMTP config
│   │   └── constants.js          # App constants (roles, limits)
│   ├── controllers/              # 15 controllers (request handlers)
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── adminController.js
│   │   ├── withdrawalController.js
│   │   ├── transactionController.js
│   │   ├── credentialController.js
│   │   ├── serviceController.js
│   │   ├── referralController.js
│   │   ├── settingsController.js
│   │   ├── notificationController.js
│   │   ├── broadcastController.js
│   │   ├── currencyController.js
│   │   ├── giftCardController.js
│   │   ├── paymentProofController.js
│   │   └── passwordResetController.js
│   ├── middleware/               # 6 middleware modules
│   │   ├── authMiddleware.js     # JWT validation, ban check
│   │   ├── adminMiddleware.js    # Role-based access
│   │   ├── errorMiddleware.js    # Global error handler
│   │   ├── rateLimiter.js        # Request throttling
│   │   ├── securityMiddleware.js # CORS, helmet, sanitize, XSS, HPP
│   │   └── uploadMiddleware.js   # Multer file upload config
│   ├── models/                   # 13 Mongoose models
│   │   ├── User.js               # Users (124 lines)
│   │   ├── Transaction.js        # Transactions (60 lines)
│   │   ├── Withdrawal.js         # Withdrawals (56 lines)
│   │   ├── Credential.js         # Payment credentials (49 lines)
│   │   ├── Service.js            # Payment services (65 lines)
│   │   ├── Referral.js           # Referral tracking (41 lines)
│   │   ├── Notification.js       # Notifications (44 lines)
│   │   ├── Settings.js           # Platform settings (30 lines)
│   │   ├── Broadcast.js          # Admin broadcasts (45 lines)
│   │   ├── ExchangeRate.js       # Currency exchange rates (51 lines)
│   │   ├── GiftCard.js           # Gift cards (38 lines)
│   │   ├── PaymentProof.js       # Payment proof uploads (95 lines)
│   │   └── PasswordResetToken.js # Password reset tokens (38 lines)
│   ├── routes/                   # 16 route files
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── withdrawalRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── credentialRoutes.js
│   │   ├── serviceRoutes.js
│   │   ├── referralRoutes.js
│   │   ├── settingsRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── broadcastRoutes.js
│   │   ├── currencyRoutes.js
│   │   ├── giftCardRoutes.js
│   │   ├── paymentProofRoutes.js
│   │   └── passwordResetRoutes.js
│   ├── services/                 # 11 business logic services
│   │   ├── authService.js        # Registration, login (180 lines)
│   │   ├── withdrawalService.js  # Withdrawal processing (243 lines)
│   │   ├── transactionService.js # Transaction handling (122 lines)
│   │   ├── referralService.js    # Referral logic (39 lines)
│   │   ├── credentialService.js  # Credential management (171 lines)
│   │   ├── notificationService.js # Notifications (217 lines)
│   │   ├── emailService.js       # Email sending (236 lines)
│   │   ├── broadcastService.js   # Broadcasts (98 lines)
│   │   ├── currencyService.js    # Currency/exchange (85 lines)
│   │   ├── paymentProofService.js # Payment proofs (147 lines)
│   │   └── passwordResetService.js # Password resets (79 lines)
│   ├── utils/                    # Utility functions
│   │   ├── generateToken.js      # JWT token generation
│   │   ├── validators.js         # Input validation
│   │   ├── logger.js             # Request logging
│   │   ├── responseHandler.js    # Standardized responses
│   │   └── helpers.js            # Shared helper functions
│   └── templates/                # Email templates
├── frontend/
│   ├── index.html                # Landing page
│   ├── login.html                # User login
│   ├── register.html             # User registration
│   ├── forgot-password.html      # Password reset request
│   ├── reset-password.html       # Password reset confirmation
│   ├── dashboard.html            # User dashboard
│   ├── withdrawal.html           # Withdrawal requests
│   ├── transactions.html         # Transaction history
│   ├── credentials.html          # View assigned credentials
│   ├── settings.html             # Profile, bank, password, notifications
│   ├── referrals.html            # Referral program
│   ├── notifications.html        # Notifications center
│   ├── profile.html              # User profile
│   ├── support.html              # Support/contact
│   ├── giftcards.html            # Gift cards
│   ├── payment-proof.html        # Upload payment proof
│   ├── admin.html                # Admin analytics dashboard
│   ├── admin-users.html          # User management
│   ├── admin-withdrawals.html    # Withdrawal management
│   ├── admin-transactions.html   # Transaction management
│   ├── admin-services.html       # Service management
│   ├── admin-credentials.html    # Credential management
│   ├── admin-referrals.html      # Referral management
│   ├── admin-settings.html       # Platform settings
│   ├── admin-broadcast.html      # Admin broadcasts
│   ├── admin-exchange-rates.html # Exchange rate management
│   ├── admin-payment-proofs.html # Payment proof management
│   ├── css/                      # 7 stylesheets
│   │   ├── style.css             # Base styles & landing
│   │   ├── auth.css              # Authentication pages
│   │   ├── dashboard.css         # Dashboard layout
│   │   ├── admin.css             # Admin styles
│   │   ├── animations.css        # Keyframe animations
│   │   ├── variables.css         # CSS variables
│   │   └── responsive.css        # Media queries
│   └── js/                       # 17 JavaScript files
│       ├── api.js                # API client (all endpoints)
│       ├── utils.js              # Shared utilities
│       ├── auth.js               # Auth handlers
│       ├── main.js               # Landing page scripts
│       ├── dashboard.js          # Dashboard logic
│       ├── withdrawal.js         # Withdrawal logic
│       ├── transactions.js       # Transaction logic
│       ├── settings.js           # Settings logic
│       ├── referrals.js          # Referrals logic
│       ├── notifications.js      # Notifications logic
│       ├── admin.js              # Admin logic
│       ├── credential-rates.js   # Credential rate display
│       ├── credentials.js        # Credentials page
│       ├── avatar.js             # User avatar handling
│       ├── live-converter.js     # Currency converter
│       ├── payment-proof.js      # Payment proof upload
│       ├── theme-toggle.js       # Dark/light mode
│       └── toast.js              # Toast notifications
└── README.md                     # Project documentation
```

---

## 4. Database Schema (MongoDB Collections)

### 4.1 Users Collection
```javascript
{
  fullName: String (required, max 100),
  username: String (required, unique, lowercase, 3-30 chars),
  email: String (required, unique, lowercase),
  phoneNumber: String (required),
  country: String (required),
  dateOfBirth: Date (required),
  password: String (required, min 6, bcrypt hashed, select: false),
  balance: Number (default: 0, min: 0),
  bankDetails: {
    bankName: String,
    accountName: String,
    accountNumber: String,
    country: String,
    currency: String (default: 'NGN')
  },
  referralCode: String (unique, uppercase),
  referredBy: ObjectId (ref: User),
  referralCount: Number (default: 0),
  referralEarnings: Number (default: 0),
  role: String (enum: ['user', 'admin'], default: 'user'),
  isBanned: Boolean (default: false),
  isActive: Boolean (default: true),
  notificationPreferences: {
    email: Boolean (default: true),
    withdrawalUpdates: Boolean (default: true),
    balanceUpdates: Boolean (default: true),
    systemUpdates: Boolean (default: true)
  },
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 4.2 Transactions Collection
```javascript
{
  user: ObjectId (ref: User, required, indexed),
  type: String (enum: ['deposit', 'withdrawal', 'referral_bonus', 'adjustment']),
  amount: Number (required, min: 0),
  description: String,
  status: String (enum: ['pending', 'completed', 'failed', 'cancelled']),
  service: String,
  credentialUsed: ObjectId (ref: Credential),
  reference: String (unique, sparse),
  metadata: Mixed (default: {}),
  createdAt: Date
}
```

### 4.3 Withdrawals Collection
```javascript
{
  user: ObjectId (ref: User, required),
  amount: Number (required, min: 1),
  bankDetails: {
    bankName: String (required),
    accountName: String (required),
    accountNumber: String (required),
    country: String (required),
    currency: String (default: 'NGN')
  },
  status: String (enum: ['pending', 'processing', 'paid', 'rejected']),
  adminNote: String,
  processedAt: Date,
  processedBy: ObjectId (ref: User),
  balanceDeducted: Boolean (default: false)
}
```

### 4.4 Services Collection
```javascript
{
  name: String (required, unique),
  displayName: String (required),
  description: String,
  icon: String (default: 'fa-money-bill'),
  color: String (default: '#00C853'),
  credentialType: String (enum: ['tag', 'email', 'phone', 'username', 'details', 'link']),
  credentialLabel: String (required),
  instructions: String,
  isActive: Boolean (default: true),
  rate: Number (default: 0, NGN per unit),
  order: Number (default: 0)
}
```

### 4.5 Credentials Collection
```javascript
{
  service: ObjectId (ref: Service),
  user: ObjectId (ref: User, default: null),
  value: String (required),          // The actual credential value
  label: String,                      // Display label
  isActive: Boolean (default: true),
  isAssigned: Boolean (default: false),
  assignedAt: Date,
  notes: String
}
```

### 4.6 Additional Collections
- **Referrals** - Referral tracking with commission
- **Notifications** - In-app notifications
- **Settings** - Platform configuration (limits, commissions)
- **Broadcasts** - Admin announcements
- **ExchangeRates** - Currency exchange rates
- **GiftCards** - Gift card management
- **PaymentProofs** - Payment proof uploads (with file storage)
- **PasswordResetTokens** - Password reset token management

---

## 5. API Endpoints

### 5.1 Authentication (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/password` | Update password |
| POST | `/api/auth/forgot-password` | Initiate password reset |

### 5.2 User (`/api/users`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/users/profile` | Update profile |
| PUT | `/api/users/bank-details` | Save bank details |
| GET | `/api/users/bank-details` | Get bank details |
| PUT | `/api/users/notifications` | Update notification preferences |
| GET | `/api/users/credentials` | Get my assigned credentials |

### 5.3 Transactions (`/api/transactions`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions/my` | Get my transactions |
| POST | `/api/transactions/deposit` | Create deposit request |

### 5.4 Withdrawals (`/api/withdrawals`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/withdrawals` | Create withdrawal request |
| GET | `/api/withdrawals/my` | Get my withdrawals |

### 5.5 Admin (`/api/admin`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Get analytics stats |
| GET | `/api/admin/users` | Get all users |
| GET | `/api/admin/users/:id` | Get user details |
| PUT | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |
| PUT | `/api/admin/users/:id/ban` | Ban user |
| PUT | `/api/admin/users/:id/unban` | Unban user |
| PUT | `/api/admin/users/:id/balance` | Adjust user balance |
| GET | `/api/withdrawals/all` | Get all withdrawals |
| PUT | `/api/withdrawals/:id/status` | Update withdrawal status |
| GET | `/api/transactions/all` | Get all transactions |
| PUT | `/api/transactions/:id/confirm` | Confirm deposit |
| GET | `/api/credentials` | Get all credentials |
| POST | `/api/credentials` | Create credential |
| PUT | `/api/credentials/:id` | Update credential |
| PUT | `/api/credentials/:id/assign` | Assign to user |
| PUT | `/api/credentials/:id/unassign` | Unassign from user |
| DELETE | `/api/credentials/:id` | Delete credential |
| GET | `/api/referrals/all` | Get all referrals |
| PUT | `/api/settings` | Update setting |
| PUT | `/api/settings/batch` | Update multiple settings |

### 5.6 Additional Routes
- `/api/services` - Payment service management
- `/api/referrals` - Referral operations
- `/api/settings` - Platform settings
- `/api/notifications` - Notification management
- `/api/payment-proofs` - Payment proof upload/view
- `/api/currency` - Currency conversion/exchange rates
- `/api/gift-cards` - Gift card management
- `/api/password-reset` - Password reset flow
- `/api/broadcasts` - Admin broadcast messages

### 5.7 Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API health status (no auth) |

---

## 6. Environment Variables

### Required Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `MONGO_URI` | MongoDB connection string | mongodb://localhost:27017/naijapay |
| `JWT_SECRET` | Secret key for JWT signing | (required) |
| `JWT_EXPIRES` | JWT expiration time | 30d |
| `ADMIN_EMAIL` | Email that gets admin role | admin@naijapay.com |
| `ADMIN_PASSWORD` | Default admin password ref | admin123 |
| `NODE_ENV` | Environment mode | development |
| `FRONTEND_URL` | Allowed CORS origin | http://localhost:3000 |

### Optional (Email/SMTP)
| Variable | Description | Default |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server host | smtp.gmail.com |
| `SMTP_PORT` | SMTP port | 587 |
| `SMTP_USER` | SMTP username | (empty) |
| `SMTP_PASS` | SMTP password | (empty) |

---

## 7. Security Architecture

### 7.1 Authentication Flow
1. User registers with fullName, username, email, phone, country, DOB, password
2. If email matches `ADMIN_EMAIL`, user gets `admin` role
3. Password hashed with bcrypt (12 salt rounds)
4. On login, JWT token generated (expires in 30d)
5. Token sent in `Authorization: Bearer <token>` header
6. `authMiddleware` verifies token on protected routes
7. Checks for banned/inactive accounts

### 7.2 Security Middleware Stack (in order)
1. **Helmet** - Security headers (CSP, CORS, etc.)
2. **CORS** - Configurable origin allowlist:
   - localhost:anyPort
   - 127.0.0.1:anyPort
   - 192.168.x.x (local Wi-Fi)
   - 10.x.x.x (private network)
   - 172.16-31.x.x (private network)
   - FRONTEND_URL env var
   - file:// protocol (mobile apps)
3. **express-mongo-sanitize** - Prevents NoSQL injection
4. **xss-clean** - Sanitizes user input against XSS
5. **hpp** - Prevents HTTP Parameter Pollution
6. **Rate Limiting** - 20 auth req/15min, 100 API req/15min

### 7.3 Admin Authorization
- `adminMiddleware` checks `req.user.role === 'admin'`
- Admin routes protected by both `authMiddleware` + `adminMiddleware`

---

## 8. Business Logic

### 8.1 Payment Flow
1. Admin creates services (Cash App, Zelle, etc.)
2. Admin creates credentials and assigns them to users
3. User sees assigned credentials in dashboard
4. US sender sends money to that credential
5. Admin verifies receipt and manually increases user's balance
6. User requests withdrawal to Nigerian bank account
7. Admin processes withdrawal and updates status
8. User receives notification

### 8.2 Referral System
- Each user gets a unique referral code on registration
- When someone signs up with a referral code:
  - Referrer gets commission (default: NGN 5)
  - `referralCount` incremented
  - Transaction record created for the bonus
  - Notification sent to referrer
- Commission amount stored in `Settings` collection

### 8.3 Transaction Types
- `deposit` - User deposits money
- `withdrawal` - User withdraws money
- `referral_bonus` - Referral commission
- `adjustment` - Admin balance adjustment

### 8.4 Withdrawal Status Flow
```
pending -> processing -> paid
                    -> rejected
```

---

## 9. Frontend Architecture

### 9.1 API Client (`api.js`)
- Dynamic base URL detection
- Works on localhost, local network, and production
- Bearer token authentication from localStorage
- FormData support for file uploads
- Centralized error handling

### 9.2 Page Structure
- Each page is a standalone HTML file
- Shared CSS files for consistent styling
- Module-based JavaScript (one file per page)

### 9.3 Authentication State
- Token stored in `localStorage` as `token`
- User data fetched on page load via `/api/auth/me`
- Role-based UI rendering (admin vs user)

---

## 10. Dependencies

### Production Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.18.2 | Web framework |
| mongoose | ^8.0.3 | MongoDB ODM |
| bcryptjs | ^2.4.3 | Password hashing |
| jsonwebtoken | ^9.0.2 | JWT tokens |
| cors | ^2.8.5 | Cross-origin requests |
| dotenv | ^16.3.1 | Environment variables |
| helmet | ^7.1.0 | Security headers |
| express-mongo-sanitize | ^2.2.0 | NoSQL injection prevention |
| express-rate-limit | ^7.1.5 | Rate limiting |
| hpp | ^0.2.3 | HTTP Parameter Pollution |
| xss-clean | ^0.1.4 | XSS prevention |
| morgan | ^1.10.0 | HTTP request logging |
| multer | ^2.1.1 | File uploads |
| nodemailer | ^6.9.7 | Email sending |

### Dev Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| nodemon | ^3.0.2 | Auto-restart server |

---

## 11. Key Files Analysis

### 11.1 Backend Code Distribution
- **Total lines**: ~3,847 lines of JavaScript
- **Controllers**: 15 files, ~1,032 lines
- **Services**: 11 files, ~1,697 lines
- **Models**: 13 files, ~686 lines
- **Middleware**: 6 files, ~277 lines
- **Routes**: 16 files, ~228 lines
- **Config**: 4 files
- **Utils**: 5 files

### 11.2 Largest Files
1. `services/withdrawalService.js` - 243 lines
2. `services/notificationService.js` - 217 lines
3. `services/emailService.js` - 236 lines
4. `services/authService.js` - 180 lines
5. `controllers/adminController.js` - 163 lines

---

## 12. Development Notes

### 12.1 Starting the Application
```bash
# Backend
cd backend
npm install
# .env file already created
cp .env.example .env  # or use the created .env
npm start        # production
npm run dev      # development with nodemon

# Frontend (static HTML)
cd frontend
# Serve with any static file server:
# VS Code Live Server, Python http.server, or npx serve
```

### 12.2 Admin Setup
1. Set `ADMIN_EMAIL` in `.env`
2. Register with that email
3. Automatically gets `admin` role
4. Access admin dashboard at `admin.html`

### 12.3 MongoDB Setup
- **Local**: Start `mongod`, use default URI
- **Atlas**: Create cluster, get connection string, update `MONGO_URI`

### 12.4 Email Setup (Optional)
- Configure SMTP settings in `.env`
- Gmail requires App Password (not regular password)
- Used for password reset and notifications

---

## 13. Potential Areas for Enhancement

1. **Frontend Framework** - Currently vanilla JS; could benefit from React/Vue
2. **API Documentation** - No Swagger/OpenAPI docs
3. **Testing** - No test suite (Jest/Mocha)
4. **Real-time Updates** - No WebSocket for live notifications
5. **Database Indexes** - Some queries may benefit from additional indexes
6. **Input Validation** - Could use express-validator for more robust validation
7. **Rate Limiting** - Could add per-user rate limiting
8. **Caching** - No Redis caching layer
9. **Logging** - Could use structured logging (Winston/Pino)
10. **Docker** - No containerization setup

---

## 14. Files Created
- `/mnt/agents/output/Naijapay/backend/.env` - Environment configuration

---

*Analysis completed on 2026-05-07*
*Repository cloned to: /mnt/agents/output/Naijapay/*
