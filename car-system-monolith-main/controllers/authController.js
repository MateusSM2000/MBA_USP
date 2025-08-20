const User = require('../models/User');

const authController = {
  // Exibir página de login
  showLogin: (req, res) => {
    if (req.session.user) {
      return res.redirect('/dashboard');
    }
    res.render('auth/login', { 
      title: 'Login - Sistema de Carros',
      error: req.flash('error'),
      success: req.flash('success')
    });
  },

  // Processar login
  login: async (req, res) => {
    try {
      const { email, senha } = req.body;

      // Validações básicas
      if (!email || !senha) {
        req.flash('error', 'Email e senha são obrigatórios.');
        return res.redirect('/login');
      }

      // Buscar usuário
      const user = await User.findByEmail(email);
      if (!user) {
        req.flash('error', 'Email ou senha incorretos.');
        return res.redirect('/login');
      }

      // Verificar senha
      const isValidPassword = await user.verifyPassword(senha);
      if (!isValidPassword) {
        req.flash('error', 'Email ou senha incorretos.');
        return res.redirect('/login');
      }

      // Criar sessão
      req.session.user = {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo_usuario: user.tipo_usuario
      };

      req.flash('success', `Bem-vindo, ${user.nome}!`);
      res.redirect('/dashboard');

    } catch (error) {
      console.error('Erro no login:', error);
      req.flash('error', 'Erro interno. Tente novamente.');
      res.redirect('/login');
    }
  },

  // Exibir página de registro
  showRegister: (req, res) => {
    if (req.session.user) {
      return res.redirect('/dashboard');
    }
    res.render('auth/register', { 
      title: 'Cadastro - Sistema de Carros',
      error: req.flash('error'),
      success: req.flash('success')
    });
  },

  // Processar registro
  register: async (req, res) => {
    try {
      const { nome, email, senha, confirmar_senha, tipo_usuario } = req.body;

      // Validações
      if (!nome || !email || !senha || !confirmar_senha) {
        req.flash('error', 'Todos os campos são obrigatórios.');
        return res.redirect('/register');
      }

      if (senha !== confirmar_senha) {
        req.flash('error', 'As senhas não coincidem.');
        return res.redirect('/register');
      }

      if (senha.length < 6) {
        req.flash('error', 'A senha deve ter pelo menos 6 caracteres.');
        return res.redirect('/register');
      }

      // Verificar se email já existe
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        req.flash('error', 'Este email já está cadastrado.');
        return res.redirect('/register');
      }

      // Criar usuário
      const userData = {
        nome,
        email,
        senha,
        tipo_usuario: tipo_usuario || 'visualizador'
      };

      await User.create(userData);
      req.flash('success', 'Cadastro realizado com sucesso! Faça login para continuar.');
      res.redirect('/login');

    } catch (error) {
      console.error('Erro no registro:', error);
      req.flash('error', 'Erro interno. Tente novamente.');
      res.redirect('/register');
    }
  },

  // Logout
  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Erro ao fazer logout:', err);
      }
      res.redirect('/login');
    });
  }
};

module.exports = authController;
