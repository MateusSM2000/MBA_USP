# 🚪 Car Microservices com API Gateway

Sistema de gestão de veículos desenvolvido com **arquitetura de microserviços + API Gateway**, demonstrando as melhores práticas de desenvolvimento moderno com ponto único de entrada.

## 🏗️ Arquitetura

```
┌─────────────┐    ┌─────────────┐    ┌─────────────────────────────┐
│   Cliente   │    │ API Gateway │    │       Microserviços         │
│  (Browser)  │◄──►│ Porta 4000  │◄──►│ • Frontend Service (4003)   │
│             │    │             │    │ • Auth Service (4001)       │
│             │    │ • Rate Limit│    │ • Car Service (4002)        │
│             │    │ • Auth      │    │                             │
│             │    │ • Routing   │    │                             │
└─────────────┘    └─────────────┘    └─────────────────────────────┘
```

## 🚀 Início Rápido

### 1. Iniciar Sistema
```bash
./start.sh
```

### 2. Acessar Interface
- **🌐 Interface Principal**: http://localhost:4000
- **📚 Documentação**: http://localhost:4000/docs.html
- **📊 Health Gateway**: http://localhost:4000/gateway/health
- **🔍 Status Serviços**: http://localhost:4000/gateway/services

### 3. Usuários de Teste
```
👤 Admin: admin@carros.com / admin123
👤 User:  user@carros.com / user123
```

### 4. Parar Sistema
```bash
./stop.sh
```

## 🛡️ Recursos do API Gateway

### ✅ **Funcionalidades Implementadas:**
- **Ponto único de entrada** - Todas as requisições via porta 3000
- **Autenticação centralizada** - Middleware de validação de sessão
- **Rate limiting** - 1000 requisições por IP a cada 15 minutos
- **Roteamento inteligente** - Proxy para serviços apropriados
- **Monitoramento** - Health checks e status de serviços
- **Segurança** - Helmet, CORS, validação de entrada
- **Logging** - Registro centralizado de requisições
- **Error handling** - Tratamento de erros padronizado

### 🔀 **Roteamento:**
```javascript
/                    → Frontend Service (4003)
/api/auth/*         → Auth Service (4001)
/api/cars/*         → Car Service (4002)
/api/stats          → Car Service (4002)/stats
/gateway/health     → API Gateway health
/gateway/services   → Status de todos os serviços
```

## 📊 Serviços

### 🚪 **API Gateway (Porta 4000)**
- **Responsabilidade**: Ponto único de entrada
- **Tecnologias**: Express.js, http-proxy-middleware, helmet
- **Recursos**: Rate limiting, autenticação, roteamento

### 🌐 **Frontend Service (Porta 4003)**
- **Responsabilidade**: Interface web do usuário
- **Tecnologias**: Express.js, EJS, Bootstrap 5
- **Mudanças**: Recebe dados do usuário via headers do gateway

### 🔐 **Auth Service (Porta 4001)**
- **Responsabilidade**: Autenticação e sessões
- **Tecnologias**: Express.js, bcryptjs
- **Sem mudanças**: Mantém API original

### 🚗 **Car Service (Porta 4002)**
- **Responsabilidade**: CRUD de veículos
- **Tecnologias**: Express.js, SQLite
- **Sem mudanças**: Mantém API original

## 🔧 APIs

### 🚪 **API Gateway Endpoints:**
```http
GET  /gateway/health          # Health check do gateway
GET  /gateway/services        # Status de todos os serviços
```

### 🔐 **Auth API (via Gateway):**
```http
POST /api/auth/login          # Login
POST /api/auth/verify         # Verificar sessão
POST /api/auth/logout         # Logout
GET  /api/auth/validate/:id   # Validar sessão
```

### 🚗 **Car API (via Gateway):**
```http
GET    /api/cars              # Listar carros
GET    /api/cars/:id          # Obter carro
POST   /api/cars              # Criar carro (admin)
PUT    /api/cars/:id          # Atualizar carro (admin)
DELETE /api/cars/:id          # Deletar carro (admin)
GET    /api/stats             # Estatísticas (admin)
```

## 🛠️ Desenvolvimento

### **Estrutura do Projeto:**
```
car-microservices-apigw/
├── api-gateway/           # API Gateway (novo)
├── frontend-service/      # Interface web (renomeado)
├── auth-service/          # Serviço de autenticação
├── car-service/           # Serviço de carros
├── logs/                  # Logs dos serviços
├── start.sh              # Script de inicialização
├── stop.sh               # Script de parada
└── README.md             # Esta documentação
```

### **Instalação Manual:**
```bash
# Instalar dependências de todos os serviços
cd api-gateway && npm install && cd ..
cd frontend-service && npm install && cd ..
cd auth-service && npm install && cd ..
cd car-service && npm install && cd ..

# Iniciar serviços individualmente
cd auth-service && npm start &
cd car-service && npm start &
cd frontend-service && npm start &
cd api-gateway && npm start &
```

## 📋 Logs e Monitoramento

### **Visualizar Logs:**
```bash
# Logs individuais
tail -f logs/api-gateway.log
tail -f logs/frontend-service.log
tail -f logs/auth-service.log
tail -f logs/car-service.log

# Todos os logs
tail -f logs/*.log
```

### **Health Checks:**
```bash
# Gateway
curl http://localhost:4000/gateway/health

# Serviços individuais
curl http://localhost:4001/health  # Auth
curl http://localhost:4002/health  # Car
curl http://localhost:4003/health  # Frontend

# Status de todos os serviços
curl http://localhost:4000/gateway/services
```
---
