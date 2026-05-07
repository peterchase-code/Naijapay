# NaijaPay - USA-to-Nigeria Payment Platform

A complete full-stack web application for receiving USA payments in Nigeria through assigned payment credentials such as Cash App tags, Zelle details, Chime details, Apple Pay details, PayPal details, and other supported payment methods.

## Features

### User Features
- **Account Registration & Login** - Secure JWT-based authentication with bcrypt password hashing
- **Dashboard** - View balance, assigned credentials, transaction history, and quick actions
- **Receive Payments** - View admin-assigned payment credentials for supported US platforms
- **Withdrawal Requests** - Request withdrawals to Nigerian bank accounts
- **Transaction History** - View deposits, withdrawals, and referral earnings with status tracking
- **Bank Details Management** - Save and edit Nigerian bank account details
- **Referral System** - Unique referral codes with commission tracking
- **Notifications** - Real-time notifications for balance updates, withdrawal status, and system alerts
- **Profile Management** - Update personal information and security settings

### Admin Features
- **Analytics Dashboard** - Total users, deposits, withdrawals, pending requests, active credentials, and referral statistics
- **User Management** - View, ban/unban, delete, edit users, and view their bank details
- **Balance Management** - Manually increase or decrease user balances after payment verification
- **Withdrawal Management** - Approve, reject, mark as processing/paid, view bank details, and filter requests
- **Service Management** - Add, remove, enable/disable supported payment platforms (Cash App, Zelle, Chime, Apple Pay, PayPal, etc.)
- **Credential Management** - Create, assign to users, unassign, and manage payment credentials
- **Transaction Management** - View all transactions and confirm pending deposits
- **Referral Management** - Track all referrals and commissions
- **Platform Settings** - Configure deposit/withdrawal limits and referral commissions

## Tech Stack

### Frontend
- HTML5
- CSS3 (CSS Variables, Flexbox, CSS Grid, Animations)
- Vanilla JavaScript (No frameworks)
- Font Awesome Icons
- Google Fonts (Inter)

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose)

### Security
- JWT Authentication
- bcrypt Password Hashing
- Helmet Security Headers
- Express Rate Limiting
- MongoDB Sanitization
- XSS Protection
- CORS Configuration
- Input Validation

## Project Structure

```
naija-pay/
├── frontend/
│   ├── index.html              # Landing page
│   ├── login.html              # User login
│   ├── register.html           # User registration
│   ├── forgot-password.html    # Password reset
│   ├── dashboard.html          # User dashboard
│   ├── withdrawal.html         # Withdrawal requests
│   ├── transactions.html       # Transaction history
│   ├── settings.html           # Profile, bank, password, notifications
│   ├── referrals.html          # Referral program
│   ├── notifications.html      # Notifications center
│   ├── profile.html            # User profile
│   ├── support.html            # Support/contact
│   ├── admin.html              # Admin analytics dashboard
│   ├── admin-users.html        # User management
│   ├── admin-withdrawals.html  # Withdrawal management
│   ├── admin-transactions.html # Transaction management
│   ├── admin-services.html     # Service management
│   ├── admin-credentials.html  # Credential management
│   ├── admin-referrals.html    # Referral management
│   ├── admin-settings.html     # Platform settings
│   ├── css/
│   │   ├── style.css           # Base styles & landing page
│   │   ├── auth.css            # Authentication pages
│   │   ├── dashboard.css       # Dashboard layout & components
│   │   ├── admin.css           # Admin-specific styles
│   │   ├── animations.css      # Keyframe animations
│   │   ├── variables.css       # CSS variables
│   │   └── responsive.css      # Media queries
│   └── js/
│       ├── api.js              # API client (all endpoints)
│       ├── utils.js            # Shared utilities
│       ├── auth.js             # Auth handlers
│       ├── main.js             # Landing page scripts
│       ├── dashboard.js        # Dashboard logic
│       ├── withdrawal.js       # Withdrawal page logic
│       ├── transactions.js     # Transaction page logic
│       ├── settings.js         # Settings page logic
│       ├── referrals.js        # Referrals page logic
│       ├── notifications.js    # Notifications page logic
│       └── admin.js            # Admin page logic
├── backend/
│   ├── server.js               # Entry point
│   ├── .env.example            # Environment variables template
│   ├── .gitignore
│   ├── package.json
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   ├── jwt.js              # JWT helpers
│   │   └── constants.js        # App constants
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── adminController.js
│   │   ├── withdrawalController.js
│   │   ├── transactionController.js
│   │   ├── credentialController.js
│   │   ├── serviceController.js
│   │   ├── referralController.js
│   │   ├── settingsController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── adminMiddleware.js
│   │   ├── errorMiddleware.js
│   │   ├── rateLimiter.js
│   │   └── securityMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Transaction.js
│   │   ├── Withdrawal.js
│   │   ├── Credential.js
│   │   ├── Service.js
│   │   ├── Referral.js
│   │   ├── Notification.js
│   │   └── Settings.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── withdrawalRoutes.js
│   │   ├── transactionRoutes.js
│   │   ├── credentialRoutes.js
│   │   ├── serviceRoutes.js
│   │   ├── referralRoutes.js
│   │   ├── settingsRoutes.js
│   │   └── notificationRoutes.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── withdrawalService.js
│   │   ├── transactionService.js
│   │   ├── referralService.js
│   │   └── credentialService.js
│   └── utils/
│       ├── generateToken.js
│       ├── validators.js
│       ├── logger.js
│       ├── responseHandler.js
│       └── helpers.js
└── README.md
```

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

### 1. Clone or Extract the Project

```bash
cd naija-pay
```

### 2. Backend Setup

```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create your environment file:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/naija-pay
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES=30d
ADMIN_EMAIL=admin@naijapay.com
ADMIN_PASSWORD=admin123
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

> **Important:** Change `JWT_SECRET` and `ADMIN_PASSWORD` to secure values in production.

### 3. MongoDB Setup

**Option A: Local MongoDB**
- Install MongoDB Community Edition
- Start the MongoDB service: `mongod`
- The default `MONGO_URI` will work: `mongodb://localhost:27017/naijapay`

**Option B: MongoDB Atlas (Cloud)**
- Create a free cluster at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
- Create a database user and whitelist your IP
- Copy your connection string and update `MONGO_URI` in `.env`

### 4. Start the Backend

```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

The API will run at `http://localhost:5000`

### 5. Frontend Setup

The frontend consists of static HTML files. You can serve them using any static file server.

**Option A: Using VS Code Live Server**
- Install the "Live Server" extension in VS Code
- Right-click on `frontend/index.html` and select "Open with Live Server"

**Option B: Using Python (if installed)**
```bash
cd frontend
python -m http.server 3000
```

**Option C: Using Node.js npx**
```bash
cd frontend
npx serve -l 3000
```

The frontend will be available at `http://localhost:3000`

### 6. Admin Setup

The first user who registers with the `ADMIN_EMAIL` specified in `.env` will automatically be assigned the `admin` role.

**Recommended Admin Setup:**
1. Set `ADMIN_EMAIL=your-email@example.com` in `.env`
2. Register an account with that email
3. Log in - you will be redirected to the admin dashboard

## API Documentation

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/password | Update password |
| POST | /api/auth/forgot-password | Initiate password reset |

### User Endpoints (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | /api/users/profile | Update profile |
| PUT | /api/users/bank-details | Save bank details |
| GET | /api/users/bank-details | Get bank details |
| PUT | /api/users/notifications | Update notification preferences |
| GET | /api/users/credentials | Get my assigned credentials |

### Transaction Endpoints (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/transactions/my | Get my transactions |
| POST | /api/transactions/deposit | Create deposit request |

### Withdrawal Endpoints (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/withdrawals | Create withdrawal request |
| GET | /api/withdrawals/my | Get my withdrawals |

### Admin Endpoints (Admin Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/dashboard | Get analytics stats |
| GET | /api/admin/users | Get all users |
| GET | /api/admin/users/:id | Get user details |
| PUT | /api/admin/users/:id | Update user |
| DELETE | /api/admin/users/:id | Delete user |
| PUT | /api/admin/users/:id/ban | Ban user |
| PUT | /api/admin/users/:id/unban | Unban user |
| PUT | /api/admin/users/:id/balance | Adjust user balance |
| GET | /api/withdrawals/all | Get all withdrawals |
| PUT | /api/withdrawals/:id/status | Update withdrawal status |
| GET | /api/transactions/all | Get all transactions |
| PUT | /api/transactions/:id/confirm | Confirm deposit |
| GET | /api/credentials | Get all credentials |
| POST | /api/credentials | Create credential |
| PUT | /api/credentials/:id | Update credential |
| PUT | /api/credentials/:id/assign | Assign to user |
| PUT | /api/credentials/:id/unassign | Unassign from user |
| DELETE | /api/credentials/:id | Delete credential |
| GET | /api/referrals/all | Get all referrals |
| PUT | /api/settings | Update setting |
| PUT | /api/settings/batch | Update multiple settings |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGO_URI | MongoDB connection string | mongodb://localhost:27017/naijapay |
| JWT_SECRET | Secret key for JWT signing | (required) |
| JWT_EXPIRES | JWT expiration time | 30d |
| ADMIN_EMAIL | Email that gets admin role on register | admin@naijapay.com |
| ADMIN_PASSWORD | Default admin password reference | admin123 |
| NODE_ENV | Environment mode | development |
| FRONTEND_URL | Allowed CORS origin | http://localhost:3000 |

## Security Notes

1. **Always change JWT_SECRET** in production to a cryptographically secure random string
2. **Use HTTPS** in production for secure token transmission
3. **Change ADMIN_PASSWORD** and use a strong admin email
4. **Rate limiting** is active: 20 auth requests per 15 minutes per IP, 100 API requests per 15 minutes
5. **Input sanitization** protects against NoSQL injection and XSS attacks
6. **Helmet** adds security headers to all responses
7. **Passwords are hashed** with bcrypt using a salt rounds of 12

## How the Payment Flow Works

1. **Admin creates services** (e.g., Cash App, Zelle) in the admin panel
2. **Admin creates credentials** (e.g., a specific Cash App tag) and assigns them to users
3. **User sees assigned credentials** in their dashboard
4. **US sender sends money** to that credential (e.g., $cashtag)
5. **Admin verifies receipt** and manually increases the user's balance
6. **User requests withdrawal** to their Nigerian bank account
7. **Admin processes withdrawal** and updates status
8. **User receives notification** and funds in their bank account

## Troubleshooting

### Backend won't start
- Check that MongoDB is running
- Verify `.env` file exists and has valid values
- Check `MONGO_URI` is correct

### Frontend can't connect to API
- Ensure backend is running on the expected port (default 5000)
- Check browser console for CORS errors
- Verify `FRONTEND_URL` in backend `.env` matches your frontend origin

### Login/Register not working
- Check browser DevTools Network tab for API errors
- Ensure `JWT_SECRET` is set in `.env`
- Verify backend is running and accessible

### Admin pages not accessible
- Ensure the user has `role: "admin"` in the database
- The easiest way: register with the email set in `ADMIN_EMAIL`

## License

MIT License - Feel free to use and modify for your needs.

## Support

For issues or questions, contact support or check the admin panel settings.
