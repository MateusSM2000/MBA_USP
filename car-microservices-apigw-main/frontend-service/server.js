const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const path = require('path');

const app = express();
const PORT = 4003; // Changed from 3003 to 4003
const CAR_SERVICE_URL = 'http://localhost:4002'; // Call car service directly
const AUTH_SERVICE_URL = 'http://localhost:4001'; // Call auth service directly

console.log('🌐 Frontend Service iniciando...');
console.log(`🚗 Car Service: ${CAR_SERVICE_URL}`);
console.log(`🔐 Auth Service: ${AUTH_SERVICE_URL}`);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Method override middleware (configuração correta)
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    console.log(`[WEB] Method override: ${req.method} → ${method} for ${req.path}`);
    delete req.body._method
    return method
  }
}));

// Debug middleware
app.use((req, res, next) => {
  if (req.method === 'PUT' || req.method === 'DELETE') {
    console.log(`[WEB] ${req.method} ${req.path} - Body:`, Object.keys(req.body));
  }
  next();
});

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para extrair informações do usuário dos headers do API Gateway
const extractUserFromGateway = (req, res, next) => {
  if (req.headers['x-user-id']) {
    req.user = {
      id: parseInt(req.headers['x-user-id']),
      email: req.headers['x-user-email'],
      role: req.headers['x-user-role'],
      name: decodeURIComponent(req.headers['x-user-name'] || '')
    };
    req.sessionId = req.headers['x-session-id'];
    console.log(`[FRONTEND] 👤 User from gateway: ${req.user.email} (${req.user.role})`);
  }
  next();
};

app.use(extractUserFromGateway);

// Middleware de autenticação (simplificado - API Gateway já validou)
const authenticate = async (req, res, next) => {
  // Se chegou até aqui, o API Gateway já validou a autenticação
  // Apenas verificamos se temos as informações do usuário
  if (!req.user && req.path !== '/login' && req.path !== '/' && !req.path.startsWith('/docs')) {
    console.log(`[FRONTEND] ❌ No user info from gateway for ${req.path}`);
    return res.redirect('/login');
  }
  
  console.log(`[FRONTEND] ✅ User authenticated: ${req.user?.email || 'anonymous'} - ${req.path}`);
  next();
};

// Middleware para admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).render('error', {
      title: 'Acesso Negado',
      message: 'Apenas administradores podem acessar esta página',
      user: req.user
    });
  }
  next();
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'web-service',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Página inicial (pública)
app.get('/', async (req, res) => {
  // Se o usuário está autenticado, redireciona para dashboard
  if (req.user) {
    return res.redirect('/dashboard');
  }
  
  // Se não está autenticado, redireciona para login
  res.redirect('/login');
});

// Documentação (pública)
app.get('/docs', (req, res) => {
  res.redirect('/docs.html');
});

// Página de arquitetura (pública)
app.get('/architecture', async (req, res) => {
  res.render('architecture', {
    title: 'Arquitetura do Sistema - Car Microservices',
    user: req.user || null
  });
});

// Servir arquivo OpenAPI (pública)
app.get('/openapi.yaml', (req, res) => {
  res.sendFile(path.join(__dirname, '../openapi.yaml'));
});

// Página de login (apenas exibição)
app.get('/login', (req, res) => {
  res.render('login', {
    title: 'Login - Sistema de Carros',
    error: req.query.error
  });
});

// Login é processado pelo API Gateway, não aqui
// POST /login é redirecionado pelo API Gateway

// Logout também é processado pelo API Gateway
// POST /logout é redirecionado pelo API Gateway

// Dashboard (autenticado)
app.get('/dashboard', authenticate, async (req, res) => {
  try {
    // Buscar estatísticas se for admin
    let stats = null;
    if (req.user.role === 'admin') {
      const response = await axios.get(`${CAR_SERVICE_URL}/stats`, {
        headers: { 'x-session-id': req.sessionId }
      });
      stats = response.data.data;
    }

    res.render('dashboard', {
      title: 'Dashboard - Sistema de Carros',
      user: req.user,
      stats
    });
  } catch (error) {
    console.error('[WEB] Dashboard error:', error.message);
    res.render('dashboard', {
      title: 'Dashboard - Sistema de Carros',
      user: req.user,
      stats: null
    });
  }
});

// Listar carros (autenticado)
app.get('/cars', authenticate, async (req, res) => {
  try {
    const { page = 1, search = '' } = req.query;
    const response = await axios.get(`${CAR_SERVICE_URL}/cars`, {
      params: { page, search, limit: 10 }
    });

    res.render('cars', {
      title: 'Carros - Sistema de Carros',
      user: req.user,
      cars: response.data.data,
      pagination: response.data.pagination,
      search,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error('[WEB] Cars list error:', error.message);
    res.render('cars', {
      title: 'Carros - Sistema de Carros',
      user: req.user,
      cars: [],
      pagination: { page: 1, pages: 1, total: 0 },
      search: '',
      error: 'Erro ao carregar carros'
    });
  }
});

// Formulário de novo carro (admin)
app.get('/cars/new', authenticate, requireAdmin, (req, res) => {
  res.render('car-form', {
    title: 'Novo Carro - Sistema de Carros',
    user: req.user,
    car: null,
    action: '/cars',
    method: 'POST',
    error: req.query.error
  });
});

// Criar carro (admin)
app.post('/cars', authenticate, requireAdmin, async (req, res) => {
  try {
    const response = await axios.post(`${CAR_SERVICE_URL}/cars`, req.body, {
      headers: { 'x-session-id': req.sessionId }
    });

    console.log(`[WEB] ✅ Car created by ${req.user.email}`);
    res.redirect('/cars?success=' + encodeURIComponent('Carro criado com sucesso!'));
  } catch (error) {
    console.error('[WEB] Create car error:', error.message);
    const errorMessage = error.response?.data?.message || 'Erro ao criar carro';
    res.redirect('/cars/new?error=' + encodeURIComponent(errorMessage));
  }
});

// Formulário de editar carro (admin)
app.get('/cars/:id/edit', authenticate, requireAdmin, async (req, res) => {
  try {
    const response = await axios.get(`${CAR_SERVICE_URL}/cars/${req.params.id}`);
    
    res.render('car-form', {
      title: 'Editar Carro - Sistema de Carros',
      user: req.user,
      car: response.data.data,
      action: `/cars/${req.params.id}`,
      method: 'PUT',
      error: req.query.error
    });
  } catch (error) {
    console.error('[WEB] Edit car error:', error.message);
    res.redirect('/cars?error=' + encodeURIComponent('Carro não encontrado'));
  }
});

// Atualizar carro (admin)
app.put('/cars/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await axios.put(`${CAR_SERVICE_URL}/cars/${req.params.id}`, req.body, {
      headers: { 'x-session-id': req.sessionId }
    });

    console.log(`[WEB] ✅ Car ${req.params.id} updated by ${req.user.email}`);
    res.redirect('/cars?success=' + encodeURIComponent('Carro atualizado com sucesso!'));
  } catch (error) {
    console.error('[WEB] Update car error:', error.message);
    const errorMessage = error.response?.data?.message || 'Erro ao atualizar carro';
    res.redirect(`/cars/${req.params.id}/edit?error=` + encodeURIComponent(errorMessage));
  }
});

// Deletar carro (admin)
app.delete('/cars/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await axios.delete(`${CAR_SERVICE_URL}/cars/${req.params.id}`, {
      headers: { 'x-session-id': req.sessionId }
    });

    console.log(`[WEB] ✅ Car ${req.params.id} deleted by ${req.user.email}`);
    res.redirect('/cars?success=' + encodeURIComponent('Carro deletado com sucesso!'));
  } catch (error) {
    console.error('[WEB] Delete car error:', error.message);
    const errorMessage = error.response?.data?.message || 'Erro ao deletar carro';
    res.redirect('/cars?error=' + encodeURIComponent(errorMessage));
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🌐 Frontend Service rodando na porta ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`⚠️  ACESSO VIA API GATEWAY: http://localhost:4000`);
  console.log(`🚪 Este serviço não deve ser acessado diretamente!`);
  
  // Debug: listar rotas registradas
  console.log('\n📋 Rotas registradas:');
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      const methods = Object.keys(middleware.route.methods).join(', ').toUpperCase();
      console.log(`   ${methods} ${middleware.route.path}`);
    }
  });
});

module.exports = app;
