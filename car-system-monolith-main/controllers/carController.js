const Car = require('../models/Car');

// Opções para dropdowns
const TIPOS_CARRO = ['Sedan', 'Hatchback', 'SUV', 'Pickup', 'Coupe', 'Conversível', 'Wagon'];
const FABRICANTES = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Volkswagen', 'Fiat', 'Hyundai', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi'];
const COMBUSTIVEIS = ['Gasolina', 'Etanol', 'Flex', 'Diesel', 'Elétrico', 'Híbrido'];

const carController = {
  // Listar todos os carros
  index: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 10;
      const offset = (page - 1) * limit;

      const cars = await Car.getAll(limit, offset);
      const stats = await Car.getStats();

      res.render('cars/index', {
        title: 'Gerenciar Carros',
        cars,
        stats,
        currentPage: page,
        user: req.session.user
      });
    } catch (error) {
      console.error('Erro ao listar carros:', error);
      req.flash('error', 'Erro ao carregar lista de carros.');
      res.redirect('/dashboard');
    }
  },

  // Exibir formulário de criação
  showCreate: (req, res) => {
    res.render('cars/create', {
      title: 'Cadastrar Novo Carro',
      tipos: TIPOS_CARRO,
      fabricantes: FABRICANTES,
      combustiveis: COMBUSTIVEIS,
      car: {},
      errors: []
    });
  },

  // Criar novo carro
  create: async (req, res) => {
    try {
      const carData = {
        modelo: req.body.modelo?.trim(),
        fabricante: req.body.fabricante?.trim(),
        tipo: req.body.tipo?.trim(),
        marca_modelo: req.body.marca_modelo?.trim(),
        ano_fabricacao: parseInt(req.body.ano_fabricacao),
        cor: req.body.cor?.trim(),
        preco: req.body.preco ? parseFloat(req.body.preco) : null,
        combustivel: req.body.combustivel?.trim(),
        quilometragem: req.body.quilometragem ? parseInt(req.body.quilometragem) : 0,
        observacoes: req.body.observacoes?.trim()
      };

      // Validações
      const errors = [];
      if (!carData.modelo) errors.push('Modelo é obrigatório');
      if (!carData.fabricante) errors.push('Fabricante é obrigatório');
      if (!carData.tipo) errors.push('Tipo é obrigatório');
      if (!carData.marca_modelo) errors.push('Marca/Modelo é obrigatório');
      if (!carData.ano_fabricacao || carData.ano_fabricacao < 1900 || carData.ano_fabricacao > new Date().getFullYear() + 1) {
        errors.push('Ano de fabricação inválido');
      }

      if (errors.length > 0) {
        return res.render('cars/create', {
          title: 'Cadastrar Novo Carro',
          tipos: TIPOS_CARRO,
          fabricantes: FABRICANTES,
          combustiveis: COMBUSTIVEIS,
          car: carData,
          errors
        });
      }

      await Car.create(carData);
      req.flash('success', 'Carro cadastrado com sucesso!');
      res.redirect('/cars');

    } catch (error) {
      console.error('Erro ao criar carro:', error);
      req.flash('error', 'Erro ao cadastrar carro.');
      res.redirect('/cars');
    }
  },

  // Exibir detalhes do carro
  show: async (req, res) => {
    try {
      const car = await Car.getById(req.params.id);
      if (!car) {
        req.flash('error', 'Carro não encontrado.');
        return res.redirect('/cars');
      }

      res.render('cars/show', {
        title: `${car.fabricante} ${car.modelo}`,
        car
      });
    } catch (error) {
      console.error('Erro ao exibir carro:', error);
      req.flash('error', 'Erro ao carregar detalhes do carro.');
      res.redirect('/cars');
    }
  },

  // Exibir formulário de edição
  showEdit: async (req, res) => {
    try {
      const car = await Car.getById(req.params.id);
      if (!car) {
        req.flash('error', 'Carro não encontrado.');
        return res.redirect('/cars');
      }

      res.render('cars/edit', {
        title: `Editar ${car.fabricante} ${car.modelo}`,
        tipos: TIPOS_CARRO,
        fabricantes: FABRICANTES,
        combustiveis: COMBUSTIVEIS,
        car,
        errors: []
      });
    } catch (error) {
      console.error('Erro ao carregar formulário de edição:', error);
      req.flash('error', 'Erro ao carregar formulário.');
      res.redirect('/cars');
    }
  },

  // Atualizar carro
  update: async (req, res) => {
    try {
      const carData = {
        modelo: req.body.modelo?.trim(),
        fabricante: req.body.fabricante?.trim(),
        tipo: req.body.tipo?.trim(),
        marca_modelo: req.body.marca_modelo?.trim(),
        ano_fabricacao: parseInt(req.body.ano_fabricacao),
        cor: req.body.cor?.trim(),
        preco: req.body.preco ? parseFloat(req.body.preco) : null,
        combustivel: req.body.combustivel?.trim(),
        quilometragem: req.body.quilometragem ? parseInt(req.body.quilometragem) : 0,
        observacoes: req.body.observacoes?.trim()
      };

      // Validações
      const errors = [];
      if (!carData.modelo) errors.push('Modelo é obrigatório');
      if (!carData.fabricante) errors.push('Fabricante é obrigatório');
      if (!carData.tipo) errors.push('Tipo é obrigatório');
      if (!carData.marca_modelo) errors.push('Marca/Modelo é obrigatório');
      if (!carData.ano_fabricacao || carData.ano_fabricacao < 1900 || carData.ano_fabricacao > new Date().getFullYear() + 1) {
        errors.push('Ano de fabricação inválido');
      }

      if (errors.length > 0) {
        const car = await Car.getById(req.params.id);
        return res.render('cars/edit', {
          title: `Editar ${car.fabricante} ${car.modelo}`,
          tipos: TIPOS_CARRO,
          fabricantes: FABRICANTES,
          combustiveis: COMBUSTIVEIS,
          car: { ...car, ...carData },
          errors
        });
      }

      const updatedCar = await Car.update(req.params.id, carData);
      if (!updatedCar) {
        req.flash('error', 'Carro não encontrado.');
        return res.redirect('/cars');
      }

      req.flash('success', 'Carro atualizado com sucesso!');
      res.redirect(`/cars/${req.params.id}`);

    } catch (error) {
      console.error('Erro ao atualizar carro:', error);
      req.flash('error', 'Erro ao atualizar carro.');
      res.redirect('/cars');
    }
  },

  // Deletar carro
  delete: async (req, res) => {
    try {
      const deleted = await Car.delete(req.params.id);
      if (!deleted) {
        req.flash('error', 'Carro não encontrado.');
      } else {
        req.flash('success', 'Carro removido com sucesso!');
      }
      res.redirect('/cars');
    } catch (error) {
      console.error('Erro ao deletar carro:', error);
      req.flash('error', 'Erro ao remover carro.');
      res.redirect('/cars');
    }
  },

  // Buscar carros
  search: async (req, res) => {
    try {
      const filters = {
        modelo: req.query.modelo,
        fabricante: req.query.fabricante,
        tipo: req.query.tipo,
        ano_min: req.query.ano_min ? parseInt(req.query.ano_min) : null,
        ano_max: req.query.ano_max ? parseInt(req.query.ano_max) : null
      };

      const cars = await Car.search(filters);

      res.render('cars/search', {
        title: 'Buscar Carros',
        cars,
        filters,
        tipos: TIPOS_CARRO,
        fabricantes: FABRICANTES,
        totalResults: cars.length
      });
    } catch (error) {
      console.error('Erro na busca:', error);
      req.flash('error', 'Erro ao realizar busca.');
      res.redirect('/cars');
    }
  }
};

module.exports = carController;
