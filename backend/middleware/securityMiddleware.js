const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const helmet = require('helmet');
const cors = require('cors');

/**
 * Dynamic CORS origin check.
 * Allows:
 * - Any localhost port (frontend dev servers)
 * - Any 127.0.0.1 port
 * - Any local network IP (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
 * - The configured FRONTEND_URL env var
 * - file:// protocol (for mobile apps / cordova)
 */
const allowedOrigins = [
  /^http:\/\/localhost(:\d+)?$/,           // localhost:anyPort
  /^https:\/\/localhost(:\d+)?$/,          // localhost:anyPort (HTTPS)
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,        // 127.0.0.1:anyPort
  /^https:\/\/127\.0\.0\.1(:\d+)?$/,       // 127.0.0.1:anyPort (HTTPS)
  /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/,  // 192.168.x.x (local Wi-Fi)
  /^https:\/\/192\.168\.\d+\.\d+(:\d+)?$/, // 192.168.x.x (HTTPS)
  /^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/,   // 10.x.x.x (local network)
  /^https:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/,  // 10.x.x.x (HTTPS)
  /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+(:\d+)?$/,   // 172.16-31.x.x
  /^https:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+(:\d+)?$/,  // 172.16-31.x.x (HTTPS)
  /^file:\/\/.*$/,                           // file:// protocol (mobile apps)
];

// Add FRONTEND_URL from env if set
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(new RegExp('^' + process.env.FRONTEND_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

const corsOriginCallback = (origin, callback) => {
  // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
  if (!origin) return callback(null, true);

  // Check if origin matches any allowed pattern
  const isAllowed = allowedOrigins.some(pattern => pattern.test(origin));
  if (isAllowed) {
    return callback(null, true);
  }

  // In development, be lenient
  if (process.env.NODE_ENV === 'development') {
    console.log(`[CORS] Allowing origin in dev mode: ${origin}`);
    return callback(null, true);
  }

  // Production: reject unknown origins
  console.warn(`[CORS] Rejected origin: ${origin}`);
  callback(new Error(`CORS: Origin ${origin} not allowed`));
};

const corsOptions = {
  origin: corsOriginCallback,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'X-Request-ID'],
  maxAge: 86400, // Cache preflight response for 24 hours
  optionsSuccessStatus: 204, // Return 204 for OPTIONS
};

const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "http://localhost:*", "http://127.0.0.1:*", "http://192.168.*:*", "http://10.*:*", "https://*"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
};

const securityMiddleware = [
  helmet(helmetOptions),
  cors(corsOptions),
  mongoSanitize(),
  xss(),
  hpp()
];

module.exports = securityMiddleware;
