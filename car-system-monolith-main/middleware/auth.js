// Middleware para verificar se usuário está autenticado
const requireAuth = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    req.flash('error', 'Você precisa fazer login para acessar esta página.');
    res.redirect('/login');
  }
};

// Middleware para verificar se usuário é administrador
const requireAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.tipo_usuario === 'administrador') {
    next();
  } else if (req.session.user) {
    req.flash('error', 'Acesso negado. Apenas administradores podem realizar esta ação.');
    res.redirect('/dashboard');
  } else {
    req.flash('error', 'Você precisa fazer login como administrador.');
    res.redirect('/login');
  }
};

// Middleware para verificar se usuário é visualizador ou admin
const requireViewer = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    req.flash('error', 'Você precisa fazer login para visualizar esta página.');
    res.redirect('/login');
  }
};

module.exports = {
  requireAuth,
  requireAdmin,
  requireViewer
};
