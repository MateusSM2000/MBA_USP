const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

// Importar controladores
const authController = require('./controllers/authController');
const carController = require('./controllers/carController');
const dashboardController = require('./controllers/dashboardController');

// Middleware de autenticação
const { requireAuth, requireAdmin } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração de sessão
app.use(session({
  secret: 'car-system-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));

// Middleware
app.use(flash());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware global para disponibilizar dados da sessão
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Rotas públicas
app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('auth/login', { title: 'Login - Sistema de Carros' });
});

// Rotas de autenticação
app.get('/login', authController.showLogin);
app.post('/login', authController.login);
app.get('/register', authController.showRegister);
app.post('/register', authController.register);
app.post('/logout', authController.logout);

// Rotas protegidas
app.get('/dashboard', requireAuth, dashboardController.index);

// Rotas de carros (protegidas)
app.get('/cars', requireAuth, carController.index);
app.get('/cars/new', requireAdmin, carController.showCreate);
app.post('/cars', requireAdmin, carController.create);
app.get('/cars/:id', requireAuth, carController.show);
app.get('/cars/:id/edit', requireAdmin, carController.showEdit);
app.put('/cars/:id', requireAdmin, carController.update);
app.delete('/cars/:id', requireAdmin, carController.delete);

// Rota de busca
app.get('/search', requireAuth, carController.search);

// Tratamento de erros 404
app.use((req, res) => {
  res.status(404).render('error', {
    title: '404 - Página não encontrada',
    message: 'A página que você procura não existe.',
    statusCode: 404
  });
});

// Tratamento de erros gerais
app.use((err, req, res, next) => {
  console.error('Erro:', err.message);
  res.status(500).render('error', {
    title: 'Erro interno',
    message: 'Algo deu errado. Tente novamente.',
    statusCode: 500
  });
});

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`🚗 Sistema de Carros rodando em http://localhost:${PORT}`);
  console.log(`📊 Banco de dados: SQLite`);
  console.log(`🔐 Sistema de autenticação: Ativo`);
  console.log(`👤 Usuários: Admin e Visualizador`);
});

module.exports = app;
