const Car = require('../models/Car');
const User = require('../models/User');

const dashboardController = {
  // Página principal do dashboard
  index: async (req, res) => {
    try {
      // Buscar estatísticas
      const carStats = await Car.getStats();
      const userStats = await User.getStats();
      
      // Buscar carros recentes
      const recentCars = await Car.getAll(5, 0);

      // Dados para gráficos simples
      const currentYear = new Date().getFullYear();
      const years = [];
      for (let i = currentYear - 4; i <= currentYear; i++) {
        years.push(i);
      }

      res.render('dashboard/index', {
        title: 'Dashboard - Sistema de Carros',
        carStats,
        userStats,
        recentCars,
        years,
        user: req.session.user
      });
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      req.flash('error', 'Erro ao carregar dashboard.');
      res.render('dashboard/index', {
        title: 'Dashboard - Sistema de Carros',
        carStats: {},
        userStats: {},
        recentCars: [],
        years: [],
        user: req.session.user
      });
    }
  }
};

module.exports = dashboardController;
