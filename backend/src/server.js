import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';
import User from './models/User.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import companyRoutes from './routes/company.routes.js';
import documentRoutes from './routes/document.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import adminRoutes from './routes/admin.routes.js';
import settingsRoutes from './routes/settings.routes.js';

// Middleware
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

const ensureDefaultAdmin = async () => {
  const shouldSeed =
    (process.env.NODE_ENV || 'development') === 'development' ||
    process.env.SEED_DEFAULT_ADMIN === 'true';

  if (!shouldSeed) return;

  const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@admin.com';
  const password = process.env.DEFAULT_ADMIN_PASSWORD || '12345678';

  const existing = await User.findByEmail(email);
  if (existing) return;

  await User.create({ email, password, role: 'admin' });
  console.log(`[seed] Admin created: ${email}`);
};

// Middleware de sécurité
app.use(helmet());
app.use(compression());

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimiter);

// Static files (uploads, generated PDFs)
app.use('/uploads', express.static('uploads'));
app.use('/generated', express.static('generated'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'ARCH EXCELLENCE API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route non trouvée' 
  });
});

// Error Handler (doit être en dernier)
app.use(errorHandler);

// Démarrage du serveur
const startServer = async () => {
  try {
    // Tester la connexion à la base de données
    await testConnection();

    await ensureDefaultAdmin();
    
    app.listen(PORT, () => {
      console.log('=================================');
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`📍 API URL: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('=================================');
    });
  } catch (error) {
    console.error('❌ Erreur au démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();

export default app;
