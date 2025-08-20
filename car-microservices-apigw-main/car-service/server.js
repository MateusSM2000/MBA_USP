const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 4002;
const AUTH_SERVICE_URL = 'http://localhost:4001';

// Middleware
app.use(cors());
app.use(express.json());

// Banco de dados SQLite
const dbPath = path.join(__dirname, 'cars.db');
console.log('[CAR-SERVICE] Database path:', dbPath);

// Criar banco com permissões corretas
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('[CAR-SERVICE] Error opening database:', err.message);
  } else {
    console.log('[CAR-SERVICE] ✅ Connected to SQLite database');
  }
});

// Criar tabela
db.serialize(() => {
  console.log('[CAR-SERVICE] Creating table...');
  db.run(`
    CREATE TABLE IF NOT EXISTS cars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      marca TEXT NOT NULL,
      modelo TEXT NOT NULL,
      ano INTEGER NOT NULL,
      cor TEXT NOT NULL,
      preco REAL NOT NULL,
      disponivel INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('[CAR-SERVICE] Error creating table:', err.message);
    } else {
      console.log('[CAR-SERVICE] ✅ Table created/verified');
    }
  });
  
  // Inserir dados de exemplo se a tabela estiver vazia
  db.get("SELECT COUNT(*) as count FROM cars", (err, row) => {
    if (!err && row.count === 0) {
      console.log('[CAR-SERVICE] Inserindo dados de exemplo...');
      const sampleCars = [
        ['Toyota', 'Corolla', 2023, 'Branco', 85000],
        ['Honda', 'Civic', 2023, 'Prata', 90000],
        ['Ford', 'Focus', 2022, 'Azul', 75000],
        ['Volkswagen', 'Jetta', 2023, 'Preto', 95000]
      ];
      
      const stmt = db.prepare("INSERT INTO cars (marca, modelo, ano, cor, preco) VALUES (?, ?, ?, ?, ?)", (err) => {
        if (err) {
          console.error('[CAR-SERVICE] Error preparing statement:', err.message);
        }
      });
      
      sampleCars.forEach(car => {
        stmt.run(car, (err) => {
          if (err) {
            console.error('[CAR-SERVICE] Error inserting sample car:', err.message);
          }
        });
      });
      
      stmt.finalize((err) => {
        if (err) {
          console.error('[CAR-SERVICE] Error finalizing statement:', err.message);
        } else {
          console.log('[CAR-SERVICE] ✅ Dados de exemplo inseridos');
        }
      });
    } else if (err) {
      console.error('[CAR-SERVICE] Error checking car count:', err.message);
    } else {
      console.log(`[CAR-SERVICE] ✅ Database has ${row.count} cars`);
    }
  });
});

// Middleware simples de autenticação
const authenticate = async (req, res, next) => {
  const sessionId = req.headers['x-session-id'];
  
  if (!sessionId) {
    return res.status(401).json({
      success: false,
      message: 'Session ID necessário'
    });
  }

  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/validate/${sessionId}`);
    if (response.data.valid) {
      req.user = response.data.user;
      next();
    } else {
      res.status(401).json({
        success: false,
        message: 'Sessão inválida'
      });
    }
  } catch (error) {
    console.error('[CAR-SERVICE] Auth error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Erro na autenticação'
    });
  }
};

// Middleware para verificar se é admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores.'
    });
  }
  next();
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'car-service',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Listar carros (público)
app.get('/cars', (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const offset = (page - 1) * limit;

  let sql = 'SELECT * FROM cars WHERE disponivel = 1';
  let params = [];

  if (search) {
    sql += ' AND (marca LIKE ? OR modelo LIKE ?)';
    params = [`%${search}%`, `%${search}%`];
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(sql, params, (err, cars) => {
    if (err) {
      console.error('[CAR-SERVICE] Error listing cars:', err);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar carros'
      });
    }

    // Contar total
    let countSql = 'SELECT COUNT(*) as total FROM cars WHERE disponivel = 1';
    let countParams = [];
    
    if (search) {
      countSql += ' AND (marca LIKE ? OR modelo LIKE ?)';
      countParams = [`%${search}%`, `%${search}%`];
    }

    db.get(countSql, countParams, (err, count) => {
      if (err) {
        console.error('[CAR-SERVICE] Error counting cars:', err);
        return res.status(500).json({
          success: false,
          message: 'Erro ao contar carros'
        });
      }

      console.log(`[CAR-SERVICE] ✅ Listed ${cars.length} cars`);
      
      res.json({
        success: true,
        data: cars,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count.total,
          pages: Math.ceil(count.total / limit)
        }
      });
    });
  });
});

// Buscar carro por ID (público)
app.get('/cars/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM cars WHERE id = ?', [id], (err, car) => {
    if (err) {
      console.error('[CAR-SERVICE] Error finding car:', err);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar carro'
      });
    }

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Carro não encontrado'
      });
    }

    console.log(`[CAR-SERVICE] ✅ Found car: ${car.marca} ${car.modelo}`);
    res.json({
      success: true,
      data: car
    });
  });
});

// Criar carro (apenas admin)
app.post('/cars', authenticate, requireAdmin, (req, res) => {
  const { marca, modelo, ano, cor, preco } = req.body;

  console.log(`[CAR-SERVICE] Creating car by ${req.user.email}:`, { marca, modelo, ano, cor, preco });

  if (!marca || !modelo || !ano || !cor || !preco) {
    return res.status(400).json({
      success: false,
      message: 'Todos os campos são obrigatórios'
    });
  }

  const sql = 'INSERT INTO cars (marca, modelo, ano, cor, preco) VALUES (?, ?, ?, ?, ?)';
  const params = [marca, modelo, parseInt(ano), cor, parseFloat(preco)];

  db.run(sql, params, function(err) {
    if (err) {
      console.error('[CAR-SERVICE] Error creating car:', err);
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar carro'
      });
    }

    console.log(`[CAR-SERVICE] ✅ Car created with ID: ${this.lastID}`);
    
    res.status(201).json({
      success: true,
      message: 'Carro criado com sucesso',
      data: {
        id: this.lastID,
        marca,
        modelo,
        ano: parseInt(ano),
        cor,
        preco: parseFloat(preco)
      }
    });
  });
});

// Atualizar carro (apenas admin)
app.put('/cars/:id', authenticate, requireAdmin, (req, res) => {
  const { id } = req.params;
  const { marca, modelo, ano, cor, preco, disponivel } = req.body;

  console.log(`[CAR-SERVICE] Updating car ${id} by ${req.user.email}`);

  if (!marca || !modelo || !ano || !cor || !preco) {
    return res.status(400).json({
      success: false,
      message: 'Todos os campos são obrigatórios'
    });
  }

  const sql = `
    UPDATE cars 
    SET marca = ?, modelo = ?, ano = ?, cor = ?, preco = ?, disponivel = ?
    WHERE id = ?
  `;
  const params = [marca, modelo, parseInt(ano), cor, parseFloat(preco), disponivel || 1, id];

  db.run(sql, params, function(err) {
    if (err) {
      console.error('[CAR-SERVICE] Error updating car:', err);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar carro'
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Carro não encontrado'
      });
    }

    console.log(`[CAR-SERVICE] ✅ Car ${id} updated`);
    res.json({
      success: true,
      message: 'Carro atualizado com sucesso'
    });
  });
});

// Deletar carro (apenas admin)
app.delete('/cars/:id', authenticate, requireAdmin, (req, res) => {
  const { id } = req.params;

  console.log(`[CAR-SERVICE] Deleting car ${id} by ${req.user.email}`);

  db.run('DELETE FROM cars WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('[CAR-SERVICE] Error deleting car:', err);
      return res.status(500).json({
        success: false,
        message: 'Erro ao deletar carro'
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Carro não encontrado'
      });
    }

    console.log(`[CAR-SERVICE] ✅ Car ${id} deleted`);
    res.json({
      success: true,
      message: 'Carro deletado com sucesso'
    });
  });
});

// Estatísticas (autenticado)
app.get('/stats', authenticate, (req, res) => {
  console.log(`[CAR-SERVICE] Getting stats for ${req.user.email}`);

  const queries = [
    'SELECT COUNT(*) as total FROM cars',
    'SELECT COUNT(*) as disponiveis FROM cars WHERE disponivel = 1',
    'SELECT AVG(preco) as preco_medio FROM cars',
    'SELECT marca, COUNT(*) as quantidade FROM cars GROUP BY marca ORDER BY quantidade DESC LIMIT 5'
  ];

  Promise.all(queries.map(query => {
    return new Promise((resolve, reject) => {
      if (query.includes('GROUP BY')) {
        db.all(query, [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      } else {
        db.get(query, [], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      }
    });
  }))
  .then(results => {
    console.log('[CAR-SERVICE] ✅ Stats calculated');
    res.json({
      success: true,
      data: {
        total: results[0].total,
        disponiveis: results[1].disponiveis,
        preco_medio: Math.round(results[2].preco_medio || 0),
        marcas_populares: results[3]
      }
    });
  })
  .catch(err => {
    console.error('[CAR-SERVICE] Stats error:', err);
    res.status(500).json({
      success: false,
      message: 'Erro ao calcular estatísticas'
    });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚗 Car Service rodando na porta ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
});

// Fechar banco ao sair
process.on('SIGINT', () => {
  console.log('\n🛑 Fechando Car Service...');
  db.close((err) => {
    if (err) console.error('Erro ao fechar banco:', err);
    else console.log('✅ Banco fechado');
    process.exit(0);
  });
});

module.exports = app;
