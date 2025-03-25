const express = require("express");
const adminRoutes = require("../Backend/routes/admin.routes");
const userRoutes = require("../Backend/routes/user.routes");
const app = express();
const port = 8080;
const bodyParser = require("body-parser");
const cors = require("cors");
const dbConfiguration = require("../Backend/dbConfiguration/databaseconnection"); // Adjust the path as needed
const rateLimit = require("express-rate-limit");
const requestIp = require("request-ip"); // Import request-ip
const ERROR_CODES = require("./utils/errorCodes.util");
const ERROR_MESSAGES = require("./utils/errorMessage.util");
const helmet = require("helmet"); // Security headers

// To connect to MongoDB
dbConfiguration.connect();

// Trust reverse proxies (needed for accurate client IPs)
app.set("trust proxy", true);

// Security middleware to set various HTTP headers
app.use(helmet());
app.use(helmet.frameguard({ action: 'deny' })); // Prevent clickjacking
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true })); // Enforce HTTPS
app.use(helmet.noSniff()); // Prevent MIME sniffing
app.use(helmet.xssFilter()); // Prevent XSS attacks
app.use(helmet.referrerPolicy({ policy: 'no-referrer' })); // Hide referrer info

// Content Security Policy (CSP) to prevent XSS and data injection attacks
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"], // Only allow content from the same origin
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allow scripts from the same origin, inline scripts, and eval (should be restricted more if possible)
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow styles from the same origin and inline styles
      imgSrc: ["'self'", "data:"], // Allow images from the same origin and embedded base64 images
      connectSrc: ["'self'"] // Restrict fetch/XHR/WebSockets to the same origin
    },
  })
);


// Middleware to get client IP address
app.use(requestIp.mw());

// Store restricted IPs in memory (for demo purposes, better to use Redis)
const restrictedIps = new Set();

// Middleware for rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per minute
  keyGenerator: (req) => {
    const clientIp = requestIp.getClientIp(req); // Get real client IP
    console.log("Client IP:", clientIp);
    return clientIp || "unknown"; // Ensure a valid key is returned
  },
  standardHeaders: "draft-7", // Use modern RateLimit headers
  legacyHeaders: false, // Disable old X-RateLimit headers
  message: "The limit has been reached, too many requests",
  handler: (req, res) => {
    const clientIp = requestIp.getClientIp(req);

    if (clientIp && !restrictedIps.has(clientIp)) {
      restrictedIps.add(clientIp);
    }

    console.log("Restricted IPs:", Array.from(restrictedIps));
    res.status(429).json({ status: false, message: "Too many requests, please try again later." });
  },
});

// Apply rate limiter to all requests
app.use(limiter);

// Enable CORS with specific settings
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000", // Adjust based on frontend URL
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "Content-Type, Authorization",
  })
);




// Middleware to parse JSON requests
app.use(express.json());

// Middleware to parse URL-encoded data
app.use(bodyParser.urlencoded({ extended: true }));


app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);


// Default error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
 res.status(500).json({
      errorCode: ERROR_CODES.UNEXPECTED_ERROR,
      message: ERROR_MESSAGES.UNEXPECTED_ERROR,
    });
});
// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
