const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 4000;

// Service URLs
const FRONTEND_SERVICE_URL = 'http://localhost:4003';
const AUTH_SERVICE_URL = 'http://localhost:4001';
const CAR_SERVICE_URL = 'http://localhost:4002';

console.log('🚪 API Gateway iniciando...');
console.log(`📡 Frontend Service: ${FRONTEND_SERVICE_URL}`);
console.log(`🔐 Auth Service: ${AUTH_SERVICE_URL}`);
console.log(`🚗 Car Service: ${CAR_SERVICE_URL}`);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable for development
}));

// CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Add form data support
app.use(cookieParser());

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Health check for API Gateway
app.get('/gateway/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      frontend: FRONTEND_SERVICE_URL,
      auth: AUTH_SERVICE_URL,
      car: CAR_SERVICE_URL
    }
  });
});

// Authentication middleware for protected routes
const authenticateRequest = async (req, res, next) => {
  // Skip authentication for public routes
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/health',
    '/gateway/health',
    '/gateway/services',
    '/docs.html',
    '/architecture', // Architecture documentation is public
    '/openapi.yaml', // OpenAPI specification is public
    '/login', // Login page is public
    '/api/cars' // Car listing is public (GET only)
  ];
  
  const isPublicRoute = publicRoutes.some(route => req.path === route);
  const isStaticFile = req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/);
  
  if (isPublicRoute || isStaticFile) {
    console.log(`[AUTH] ✅ Public route: ${req.path}`);
    return next();
  }

  // Check for session in cookies
  const sessionId = req.cookies.sessionId;
  
  if (!sessionId) {
    console.log(`[AUTH] ❌ No session ID for ${req.path}`);
    
    // If it's an API request, return JSON error
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please login to access this resource'
      });
    }
    
    // For page requests, redirect to login
    return res.redirect('/login');
  }

  try {
    // Validate session with Auth Service
    const authResponse = await axios.get(`${AUTH_SERVICE_URL}/validate/${sessionId}`, {
      timeout: 5000
    });
    
    if (!authResponse.data.valid) {
      console.log(`[AUTH] ❌ Invalid session: ${sessionId}`);
      return res.status(401).json({ 
        error: 'Invalid session',
        message: 'Your session has expired. Please login again.'
      });
    }
    
    // Add user info to request
    req.user = authResponse.data.user;
    req.sessionId = sessionId;
    
    console.log(`[AUTH] ✅ Valid session for ${req.user.email} - ${req.path}`);
    next();
    
  } catch (error) {
    console.error(`[AUTH] ❌ Auth service error:`, error.message);
    return res.status(503).json({ 
      error: 'Authentication service unavailable',
      message: 'Please try again later'
    });
  }
};

// Apply authentication middleware
app.use(authenticateRequest);

// Service status endpoint
app.get('/gateway/services', async (req, res) => {
  const services = [
    { name: 'Frontend Service', url: `${FRONTEND_SERVICE_URL}/health` },
    { name: 'Auth Service', url: `${AUTH_SERVICE_URL}/health` },
    { name: 'Car Service', url: `${CAR_SERVICE_URL}/health` }
  ];

  const serviceStatus = await Promise.all(
    services.map(async (service) => {
      try {
        const response = await axios.get(service.url, { timeout: 3000 });
        return {
          name: service.name,
          status: 'healthy',
          responseTime: response.headers['x-response-time'] || 'N/A',
          data: response.data
        };
      } catch (error) {
        return {
          name: service.name,
          status: 'unhealthy',
          error: error.message
        };
      }
    })
  );

  res.json({
    gateway: 'healthy',
    timestamp: new Date().toISOString(),
    services: serviceStatus
  });
});

// Proxy configuration for Auth Service
app.use('/api/auth', createProxyMiddleware({
  target: AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': ''
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[PROXY] 🔐 Auth: ${req.method} ${req.path} → ${AUTH_SERVICE_URL}${req.path.replace('/api/auth', '')}`);
    
    // For POST requests with form data, ensure body is properly forwarded
    if (req.method === 'POST' && req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onError: (err, req, res) => {
    console.error(`[PROXY] ❌ Auth service error:`, err.message);
    res.status(503).json({ 
      error: 'Auth service unavailable',
      message: 'Authentication service is temporarily unavailable'
    });
  }
}));

// Proxy configuration for Car Service
app.use('/api/cars', createProxyMiddleware({
  target: CAR_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/cars': '/cars'
  },
  onProxyReq: (proxyReq, req, res) => {
    // Add session ID to headers for car service
    if (req.sessionId) {
      proxyReq.setHeader('x-session-id', req.sessionId);
    }
    console.log(`[PROXY] 🚗 Car: ${req.method} ${req.path} → ${CAR_SERVICE_URL}/cars`);
  },
  onError: (err, req, res) => {
    console.error(`[PROXY] ❌ Car service error:`, err.message);
    res.status(503).json({ 
      error: 'Car service unavailable',
      message: 'Car service is temporarily unavailable'
    });
  }
}));

// Proxy configuration for Car Stats (admin only)
app.use('/api/stats', createProxyMiddleware({
  target: CAR_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/stats': '/stats'
  },
  onProxyReq: (proxyReq, req, res) => {
    // Add session ID to headers
    if (req.sessionId) {
      proxyReq.setHeader('x-session-id', req.sessionId);
    }
    console.log(`[PROXY] 📊 Stats: ${req.method} ${req.path} → ${CAR_SERVICE_URL}/stats`);
  },
  onError: (err, req, res) => {
    console.error(`[PROXY] ❌ Stats service error:`, err.message);
    res.status(503).json({ 
      error: 'Stats service unavailable'
    });
  }
}));

// Direct login handling (simple and reliable)
app.post('/login', async (req, res) => {
  try {
    console.log('[GATEWAY] 🔐 Processing login request');
    
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      console.log('[GATEWAY] ❌ Missing credentials');
      return res.redirect('/login?error=' + encodeURIComponent('Email e senha são obrigatórios'));
    }
    
    // Forward to auth service
    const authResponse = await axios.post(`${AUTH_SERVICE_URL}/login`, {
      email: email.trim(),
      password: password
    }, {
      timeout: 5000
    });
    
    if (authResponse.data.success) {
      // Set secure cookie for local app
      res.cookie('sessionId', authResponse.data.sessionId, {
        httpOnly: true,
        secure: false, // false for local development
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax'
      });
      
      console.log(`[GATEWAY] ✅ Login successful for ${email}, redirecting to dashboard`);
      res.redirect('/dashboard');
    } else {
      console.log(`[GATEWAY] ❌ Login failed: ${authResponse.data.message}`);
      res.redirect('/login?error=' + encodeURIComponent(authResponse.data.message));
    }
  } catch (error) {
    console.error('[GATEWAY] ❌ Login error:', error.message);
    
    let errorMessage = 'Erro interno do servidor';
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Serviço de autenticação indisponível';
    }
    
    res.redirect('/login?error=' + encodeURIComponent(errorMessage));
  }
});

// Direct logout handling
app.post('/logout', async (req, res) => {
  const sessionId = req.cookies.sessionId;
  
  if (sessionId) {
    try {
      await axios.post(`${AUTH_SERVICE_URL}/logout`, { sessionId }, {
        timeout: 3000
      });
      console.log('[GATEWAY] 🚪 Logout successful');
    } catch (error) {
      console.error('[GATEWAY] ❌ Logout error:', error.message);
    }
  }
  
  res.clearCookie('sessionId');
  res.redirect('/');
});

// Handle car creation (POST /cars)
app.post('/cars', authenticateRequest, async (req, res) => {
  // Check if it's a DELETE method override
  if (req.body._method === 'DELETE') {
    // This is handled by the /cars/:id route
    return res.status(400).json({ error: 'Invalid request' });
  }
  
  try {
    console.log(`[GATEWAY] 🚗 Creating car by ${req.user.email}`);
    
    const response = await axios.post(`${CAR_SERVICE_URL}/cars`, req.body, {
      headers: { 'x-session-id': req.sessionId }
    });
    
    console.log(`[GATEWAY] ✅ Car created successfully`);
    res.redirect('/cars?success=' + encodeURIComponent('Carro criado com sucesso!'));
  } catch (error) {
    console.error('[GATEWAY] Create car error:', error.message);
    const errorMessage = error.response?.data?.message || 'Erro ao criar carro';
    res.redirect('/cars/new?error=' + encodeURIComponent(errorMessage));
  }
});

// Handle form-based PUT and DELETE for cars (method override)
app.post('/cars/:id', authenticateRequest, async (req, res) => {
  const method = req.body._method;
  
  if (method === 'DELETE') {
    try {
      console.log(`[GATEWAY] 🗑️ Form DELETE car ${req.params.id} by ${req.user.email}`);
      
      const response = await axios.delete(`${CAR_SERVICE_URL}/cars/${req.params.id}`, {
        headers: { 'x-session-id': req.sessionId }
      });
      
      console.log(`[GATEWAY] ✅ Car ${req.params.id} deleted successfully`);
      res.redirect('/cars?success=' + encodeURIComponent('Carro deletado com sucesso!'));
    } catch (error) {
      console.error('[GATEWAY] Delete car error:', error.message);
      const errorMessage = error.response?.data?.message || 'Erro ao deletar carro';
      res.redirect('/cars?error=' + encodeURIComponent(errorMessage));
    }
  } else if (method === 'PUT') {
    try {
      console.log(`[GATEWAY] ✏️ Form PUT car ${req.params.id} by ${req.user.email}`);
      
      // Remove _method from body before sending to car service
      const { _method, ...carData } = req.body;
      
      const response = await axios.put(`${CAR_SERVICE_URL}/cars/${req.params.id}`, carData, {
        headers: { 'x-session-id': req.sessionId }
      });
      
      console.log(`[GATEWAY] ✅ Car ${req.params.id} updated successfully`);
      res.redirect('/cars?success=' + encodeURIComponent('Carro atualizado com sucesso!'));
    } catch (error) {
      console.error('[GATEWAY] Update car error:', error.message);
      const errorMessage = error.response?.data?.message || 'Erro ao atualizar carro';
      res.redirect(`/cars/${req.params.id}/edit?error=` + encodeURIComponent(errorMessage));
    }
  } else {
    // Forward other POST requests to frontend service
    const proxyUrl = `${FRONTEND_SERVICE_URL}/cars/${req.params.id}`;
    console.log(`[PROXY] 🌐 Frontend: POST /cars/${req.params.id} → ${proxyUrl}`);
    
    try {
      const response = await axios.post(proxyUrl, req.body, {
        headers: {
          'x-user-id': req.user.id,
          'x-user-email': req.user.email,
          'x-user-role': req.user.role,
          'x-user-name': encodeURIComponent(req.user.name),
          'x-session-id': req.sessionId,
          'content-type': req.headers['content-type']
        }
      });
      
      res.redirect(response.headers.location || '/cars');
    } catch (error) {
      console.error('[GATEWAY] Frontend proxy error:', error.message);
      res.status(500).send('Internal Server Error');
    }
  }
});

// Proxy configuration for Frontend Service (catch-all)
app.use('/', createProxyMiddleware({
  target: FRONTEND_SERVICE_URL,
  changeOrigin: true,
  // parseReqBody: false, // Allow body parsing
  onProxyReq: (proxyReq, req, res) => {
    // Add user info to headers for frontend service
    if (req.user) {
      proxyReq.setHeader('x-user-id', req.user.id);
      proxyReq.setHeader('x-user-email', req.user.email);
      proxyReq.setHeader('x-user-role', req.user.role);
      proxyReq.setHeader('x-user-name', encodeURIComponent(req.user.name));
    }
    if (req.sessionId) {
      proxyReq.setHeader('x-session-id', req.sessionId);
    }
    
    console.log(`[PROXY] 🌐 Frontend: ${req.method} ${req.path} → ${FRONTEND_SERVICE_URL}${req.path}`);
  },
  onError: (err, req, res) => {
    console.error(`[PROXY] ❌ Frontend service error:`, err.message);
    res.status(503).json({ 
      error: 'Frontend service unavailable',
      message: 'Web interface is temporarily unavailable'
    });
  }
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong in the API Gateway'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    availableRoutes: [
      'GET /',
      'GET /api/auth/*',
      'GET /api/cars/*',
      'GET /api/stats',
      'GET /gateway/health',
      'GET /gateway/services'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚪 API Gateway rodando na porta ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/gateway/health`);
  console.log(`🔍 Services: http://localhost:${PORT}/gateway/services`);
  console.log(`🌐 Interface: http://localhost:${PORT}`);
  console.log(`\n📋 Rotas disponíveis:`);
  console.log(`   🔐 Auth API: /api/auth/*`);
  console.log(`   🚗 Car API: /api/cars/*`);
  console.log(`   📊 Stats API: /api/stats`);
  console.log(`   🌐 Frontend: /*`);
  console.log(`\n🛡️ Recursos do Gateway:`);
  console.log(`   ✅ Rate limiting (1000 req/15min)`);
  console.log(`   ✅ Authentication middleware`);
  console.log(`   ✅ Request logging`);
  console.log(`   ✅ Error handling`);
  console.log(`   ✅ Health checks`);
});
