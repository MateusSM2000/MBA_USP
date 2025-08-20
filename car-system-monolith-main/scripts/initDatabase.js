const User = require('../models/User');
const Car = require('../models/Car');

console.log('🗄️ Inicializando banco de dados do Sistema de Carros...');

// Dados de usuários padrão
const defaultUsers = [
  {
    nome: 'Administrador do Sistema',
    email: 'admin@teste.com',
    senha: '123456',
    tipo_usuario: 'administrador'
  },
  {
    nome: 'Usuário Visualizador',
    email: 'user@teste.com',
    senha: '123456',
    tipo_usuario: 'visualizador'
  }
];

// Dados de carros de exemplo
const sampleCars = [
  {
    modelo: 'Civic',
    fabricante: 'Honda',
    tipo: 'Sedan',
    marca_modelo: 'Honda Civic EXL',
    ano_fabricacao: 2023,
    cor: 'Prata',
    preco: 125000.00,
    combustivel: 'Flex',
    quilometragem: 15000,
    observacoes: 'Carro em excelente estado, revisões em dia'
  },
  {
    modelo: 'Corolla',
    fabricante: 'Toyota',
    tipo: 'Sedan',
    marca_modelo: 'Toyota Corolla XEI',
    ano_fabricacao: 2022,
    cor: 'Branco',
    preco: 115000.00,
    combustivel: 'Flex',
    quilometragem: 25000,
    observacoes: 'Único dono, manual e chave reserva'
  },
  {
    modelo: 'HB20',
    fabricante: 'Hyundai',
    tipo: 'Hatchback',
    marca_modelo: 'Hyundai HB20 Comfort',
    ano_fabricacao: 2021,
    cor: 'Azul',
    preco: 75000.00,
    combustivel: 'Flex',
    quilometragem: 35000,
    observacoes: 'Carro econômico, ideal para cidade'
  },
  {
    modelo: 'Onix',
    fabricante: 'Chevrolet',
    tipo: 'Hatchback',
    marca_modelo: 'Chevrolet Onix LT',
    ano_fabricacao: 2020,
    cor: 'Vermelho',
    preco: 68000.00,
    combustivel: 'Flex',
    quilometragem: 45000,
    observacoes: 'Carro popular, baixo custo de manutenção'
  },
  {
    modelo: 'Compass',
    fabricante: 'Jeep',
    tipo: 'SUV',
    marca_modelo: 'Jeep Compass Sport',
    ano_fabricacao: 2023,
    cor: 'Preto',
    preco: 165000.00,
    combustivel: 'Flex',
    quilometragem: 8000,
    observacoes: 'SUV completo, tração 4x4'
  },
  {
    modelo: 'Polo',
    fabricante: 'Volkswagen',
    tipo: 'Hatchback',
    marca_modelo: 'Volkswagen Polo Highline',
    ano_fabricacao: 2022,
    cor: 'Cinza',
    preco: 95000.00,
    combustivel: 'Flex',
    quilometragem: 20000,
    observacoes: 'Carro alemão, acabamento premium'
  }
];

async function initializeDatabase() {
  try {
    console.log('👥 Criando usuários padrão...');
    
    for (const userData of defaultUsers) {
      try {
        const existingUser = await User.findByEmail(userData.email);
        if (!existingUser) {
          await User.create(userData);
          console.log(`✅ Usuário criado: ${userData.nome} (${userData.email})`);
        } else {
          console.log(`ℹ️ Usuário já existe: ${userData.email}`);
        }
      } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
          console.log(`ℹ️ Usuário já existe: ${userData.email}`);
        } else {
          console.error(`❌ Erro ao criar usuário ${userData.email}:`, error.message);
        }
      }
    }

    console.log('🚗 Criando carros de exemplo...');
    
    // Verificar se já existem carros
    const existingCars = await Car.getAll(1, 0);
    
    if (existingCars.length === 0) {
      for (const carData of sampleCars) {
        try {
          await Car.create(carData);
          console.log(`✅ Carro criado: ${carData.fabricante} ${carData.modelo}`);
        } catch (error) {
          console.error(`❌ Erro ao criar carro ${carData.fabricante} ${carData.modelo}:`, error.message);
        }
      }
    } else {
      console.log(`ℹ️ Banco já contém ${existingCars.length} carros`);
    }

    console.log('🎉 Inicialização do banco de dados concluída!');
    console.log('');
    console.log('📊 Resumo:');
    console.log(`   - Usuários: ${defaultUsers.length} usuários padrão`);
    console.log(`   - Carros: ${sampleCars.length} carros de exemplo`);
    console.log('');
    console.log('🔐 Credenciais de acesso:');
    console.log('   Administrador: admin@teste.com / 123456');
    console.log('   Visualizador: user@teste.com / 123456');
    console.log('');
    console.log('🚀 Execute "npm start" para iniciar a aplicação');
    
  } catch (error) {
    console.error('❌ Erro na inicialização do banco:', error);
    process.exit(1);
  }
}

// Executar inicialização
initializeDatabase();
