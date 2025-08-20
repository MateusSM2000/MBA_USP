const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 4001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Usuários locais simples (em memória)
const users = [
  {
    id: 1,
    email: 'admin@carros.com',
    password: bcrypt.hashSync('admin123', 8), // Reduced rounds for local app
    role: 'admin',
    name: 'Administrador'
  },
  {
    id: 2,
    email: 'user@carros.com', 
    password: bcrypt.hashSync('user123', 8),
    role: 'user',
    name: 'Usuário'
  }
];

// Sessões ativas (em memória)
const activeSessions = new Map();

console.log('🔐 Auth Service rodando na porta', PORT);
console.log('📊 Health: http://localhost:' + PORT + '/health');
console.log('👤 Usuários disponíveis:');
console.log('   Admin: admin@carros.com / admin123');
console.log('   User:  user@carros.com / user123');
console.log('🔧 Sistema de login simples para aplicação local');

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    users: users.length,
    activeSessions: activeSessions.size
  });
});

// Login simples
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log(`[AUTH] 🔐 Login attempt: ${email || 'undefined'}`);

  // Validação básica
  if (!email || !password) {
    console.log('[AUTH] ❌ Missing credentials');
    return res.status(400).json({
      success: false,
      message: 'Email e senha são obrigatórios'
    });
  }

  // Validação de tamanho (para aplicação local)
  if (email.length > 100) {
    console.log('[AUTH] ❌ Email too long');
    return res.status(400).json({
      success: false,
      message: 'Email muito longo'
    });
  }

  if (password.length > 50) {
    console.log('[AUTH] ❌ Password too long');
    return res.status(400).json({
      success: false,
      message: 'Senha muito longa'
    });
  }

  // Buscar usuário
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    console.log(`[AUTH] ❌ User not found: ${email}`);
    return res.status(401).json({
      success: false,
      message: 'Email ou senha incorretos'
    });
  }

  // Verificar senha com bcrypt
  if (!bcrypt.compareSync(password, user.password)) {
    console.log(`[AUTH] ❌ Invalid password for: ${email}`);
    return res.status(401).json({
      success: false,
      message: 'Email ou senha incorretos'
    });
  }

  // Criar sessão simples
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  activeSessions.set(sessionId, {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    loginTime: new Date()
  });

  console.log(`[AUTH] ✅ Login successful: ${email} (Session: ${sessionId})`);
  
  res.json({
    success: true,
    message: 'Login realizado com sucesso',
    sessionId,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    }
  });
});

// Validar sessão
app.get('/validate/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  if (!sessionId) {
    return res.json({ valid: false, message: 'Session ID required' });
  }

  const session = activeSessions.get(sessionId);
  if (!session) {
    return res.json({ valid: false, message: 'Invalid session' });
  }

  // Verificar se a sessão não expirou (24 horas)
  const now = new Date();
  const loginTime = new Date(session.loginTime);
  const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
  
  if (hoursDiff > 24) {
    activeSessions.delete(sessionId);
    return res.json({ valid: false, message: 'Session expired' });
  }

  res.json({
    valid: true,
    user: {
      id: session.id,
      email: session.email,
      role: session.role,
      name: session.name
    }
  });
});

// Logout
app.post('/logout', (req, res) => {
  const { sessionId } = req.body;
  
  if (sessionId && activeSessions.has(sessionId)) {
    const session = activeSessions.get(sessionId);
    activeSessions.delete(sessionId);
    console.log(`[AUTH] 🚪 Logout: ${session.email} (Session: ${sessionId})`);
  }
  
  res.json({
    success: true,
    message: 'Logout realizado com sucesso'
  });
});

// Listar sessões ativas (para debug)
app.get('/sessions', (req, res) => {
  const sessions = Array.from(activeSessions.entries()).map(([sessionId, data]) => ({
    sessionId,
    user: data.email,
    role: data.role,
    loginTime: data.loginTime
  }));
  
  res.json({
    activeSessions: sessions.length,
    sessions
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Auth Service ready on port ${PORT}`);
});
