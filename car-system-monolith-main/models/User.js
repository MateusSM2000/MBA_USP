const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath);

// Inicializar tabela de usuários
const initUserTable = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        tipo_usuario VARCHAR(20) DEFAULT 'visualizador',
        ativo BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    db.run(sql, (err) => {
      if (err) {
        console.error('Erro ao criar tabela users:', err.message);
        reject(err);
      } else {
        console.log('✅ Tabela users inicializada');
        resolve();
      }
    });
  });
};

class User {
  constructor(data) {
    this.id = data.id;
    this.nome = data.nome;
    this.email = data.email;
    this.senha = data.senha;
    this.tipo_usuario = data.tipo_usuario;
    this.ativo = data.ativo;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Criar usuário
  static async create(userData) {
    return new Promise(async (resolve, reject) => {
      try {
        // Hash da senha
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.senha, saltRounds);
        
        const sql = `
          INSERT INTO users (nome, email, senha, tipo_usuario)
          VALUES (?, ?, ?, ?)
        `;
        
        const params = [
          userData.nome,
          userData.email,
          hashedPassword,
          userData.tipo_usuario || 'visualizador'
        ];
        
        db.run(sql, params, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...userData, senha: undefined });
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  // Buscar usuário por email
  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE email = ? AND ativo = 1';
      db.get(sql, [email], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(new User(row));
        } else {
          resolve(null);
        }
      });
    });
  }

  // Buscar usuário por ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE id = ? AND ativo = 1';
      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          resolve(new User(row));
        } else {
          resolve(null);
        }
      });
    });
  }

  // Verificar senha
  async verifyPassword(password) {
    return bcrypt.compare(password, this.senha);
  }

  // Verificar se é administrador
  isAdmin() {
    return this.tipo_usuario === 'administrador';
  }

  // Buscar todos os usuários
  static getAll() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT id, nome, email, tipo_usuario, ativo, created_at FROM users ORDER BY created_at DESC';
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const users = rows.map(row => new User(row));
          resolve(users);
        }
      });
    });
  }

  // Estatísticas de usuários
  static getStats() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          COUNT(*) as total_usuarios,
          SUM(CASE WHEN tipo_usuario = 'administrador' THEN 1 ELSE 0 END) as total_admins,
          SUM(CASE WHEN tipo_usuario = 'visualizador' THEN 1 ELSE 0 END) as total_visualizadores,
          SUM(CASE WHEN ativo = 1 THEN 1 ELSE 0 END) as usuarios_ativos
        FROM users
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
initUserTable().catch(console.error);

module.exports = User;
