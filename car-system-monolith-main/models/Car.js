const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath);

// Inicializar tabela de carros
const initCarTable = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      CREATE TABLE IF NOT EXISTS cars (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        modelo VARCHAR(100) NOT NULL,
        fabricante VARCHAR(100) NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        marca_modelo VARCHAR(150) NOT NULL,
        ano_fabricacao INTEGER NOT NULL,
        cor VARCHAR(50),
        preco DECIMAL(10,2),
        combustivel VARCHAR(30) DEFAULT 'Gasolina',
        quilometragem INTEGER DEFAULT 0,
        observacoes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    db.run(sql, (err) => {
      if (err) {
        console.error('Erro ao criar tabela cars:', err.message);
        reject(err);
      } else {
        console.log('✅ Tabela cars inicializada');
        resolve();
      }
    });
  });
};

class Car {
  constructor(data) {
    this.id = data.id;
    this.modelo = data.modelo;
    this.fabricante = data.fabricante;
    this.tipo = data.tipo;
    this.marca_modelo = data.marca_modelo;
    this.ano_fabricacao = data.ano_fabricacao;
    this.cor = data.cor;
    this.preco = data.preco;
    this.combustivel = data.combustivel;
    this.quilometragem = data.quilometragem;
    this.observacoes = data.observacoes;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Buscar todos os carros
  static getAll(limit = null, offset = 0) {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM cars ORDER BY created_at DESC';
      let params = [];
      
      if (limit) {
        sql += ' LIMIT ? OFFSET ?';
        params = [limit, offset];
      }
      
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const cars = rows.map(row => new Car(row));
          resolve(cars);
        }
      });
    });
  }

  // Buscar carro por ID
  static getById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM cars WHERE id = ?';
      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(new Car(row));
        } else {
          resolve(null);
        }
      });
    });
  }

  // Criar novo carro
  static create(carData) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO cars (modelo, fabricante, tipo, marca_modelo, ano_fabricacao, 
                         cor, preco, combustivel, quilometragem, observacoes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        carData.modelo,
        carData.fabricante,
        carData.tipo,
        carData.marca_modelo,
        carData.ano_fabricacao,
        carData.cor || null,
        carData.preco || null,
        carData.combustivel || 'Gasolina',
        carData.quilometragem || 0,
        carData.observacoes || null
      ];
      
      db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...carData });
        }
      });
    });
  }

  // Atualizar carro
  static update(id, carData) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE cars 
        SET modelo = ?, fabricante = ?, tipo = ?, marca_modelo = ?, 
            ano_fabricacao = ?, cor = ?, preco = ?, combustivel = ?, 
            quilometragem = ?, observacoes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      const params = [
        carData.modelo,
        carData.fabricante,
        carData.tipo,
        carData.marca_modelo,
        carData.ano_fabricacao,
        carData.cor || null,
        carData.preco || null,
        carData.combustivel || 'Gasolina',
        carData.quilometragem || 0,
        carData.observacoes || null,
        id
      ];
      
      db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          resolve(null);
        } else {
          resolve({ id, ...carData });
        }
      });
    });
  }

  // Deletar carro
  static delete(id) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM cars WHERE id = ?';
      db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  // Buscar carros com filtros
  static search(filters) {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM cars WHERE 1=1';
      let params = [];
      
      if (filters.modelo) {
        sql += ' AND modelo LIKE ?';
        params.push(`%${filters.modelo}%`);
      }
      
      if (filters.fabricante) {
        sql += ' AND fabricante LIKE ?';
        params.push(`%${filters.fabricante}%`);
      }
      
      if (filters.tipo) {
        sql += ' AND tipo = ?';
        params.push(filters.tipo);
      }
      
      if (filters.ano_min) {
        sql += ' AND ano_fabricacao >= ?';
        params.push(filters.ano_min);
      }
      
      if (filters.ano_max) {
        sql += ' AND ano_fabricacao <= ?';
        params.push(filters.ano_max);
      }
      
      sql += ' ORDER BY created_at DESC';
      
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const cars = rows.map(row => new Car(row));
          resolve(cars);
        }
      });
    });
  }

  // Estatísticas
  static getStats() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          COUNT(*) as total_carros,
          COUNT(DISTINCT fabricante) as total_fabricantes,
          COUNT(DISTINCT tipo) as total_tipos,
          AVG(preco) as preco_medio,
          MIN(ano_fabricacao) as ano_mais_antigo,
          MAX(ano_fabricacao) as ano_mais_novo
        FROM cars
      `;
      
      db.get(sql, [], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
}

// Inicializar tabela
initCarTable().catch(console.error);

module.exports = Car;
