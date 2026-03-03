require("dotenv").config();

const config = {
  env: process.env.NODE_ENV || "development",
  server: {
    port: process.env.PORT || 3000,
    baseUrl: process.env.BASE_URL || "http://localhost:3000",
  },
    database: {
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        name: process.env.DB_NAME || 'marketplace',
    },
    segurity: {
        jwtSecret: process.env.JWT_SECRET || 'dev-secrect-key-12345',
        jwtExpire: process.env.JWT_EXPIRE || '7d',
        bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || 12),
        rateLimit: {
            window: parseInt(process.env.Rate_LIMIT_WINDOW) || 15,
            max: parseInt(process.env.Rate_LIMIT_MAX) || 100
        }
    },
    ai: {
        geminiKey: process.env.GEMINI_API_KEY
    },
    uploads: {
        basepath: process.env.UPLOADS_BASE_PATH || 'src/uploads',
        maxSize: parseInt(process.env.UPLOADS_MAX_SIZE) || 5 * 1024 * 1024, // 5MB
    }
};

module.exports = config;
