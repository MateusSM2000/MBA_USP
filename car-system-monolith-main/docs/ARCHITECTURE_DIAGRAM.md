# 🏗️ Arquitetura do Sistema de Carros - Monolítico

## 📊 Diagrama de Blocos da Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NAVEGADOR DO USUÁRIO                             │
│                        (Chrome, Firefox, Safari)                           │
└─────────────────────────┬───────────────────────────────────────────────────┘
                          │ HTTP Requests/Responses
                          │ (GET, POST, PUT, DELETE)
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        APLICAÇÃO MONOLÍTICA                                │
│                         (Node.js + Express)                                │
│                           Porto: 3000                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
│  │   MIDDLEWARE    │  │     ROTAS       │  │        SESSÕES              │ │
│  │                 │  │                 │  │                             │ │
│  │ • Autenticação  │  │ • /login        │  │ • express-session           │ │
│  │ • Autorização   │  │ • /dashboard    │  │ • Controle de estado        │ │
│  │ • Flash Messages│  │ • /cars         │  │ • Dados do usuário          │ │
│  │ • Body Parser   │  │ • /search       │  │ • Timeout automático        │ │
│  │ • Static Files  │  │ • /logout       │  │                             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘ │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                          CAMADA DE CONTROLE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
│  │ authController  │  │ carController   │  │   dashboardController       │ │
│  │                 │  │                 │  │                             │ │
│  │ • showLogin()   │  │ • index()       │  │ • index()                   │ │
│  │ • login()       │  │ • create()      │  │ • getStats()                │ │
│  │ • showRegister()│  │ • show()        │  │ • recentCars()              │ │
│  │ • register()    │  │ • update()      │  │                             │ │
│  │ • logout()      │  │ • delete()      │  │                             │ │
│  │                 │  │ • search()      │  │                             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘ │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                           CAMADA DE MODELO                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐                    ┌─────────────────────────────────┐ │
│  │   User Model    │                    │          Car Model              │ │
│  │                 │                    │                                 │ │
│  │ • create()      │                    │ • getAll()                      │ │
│  │ • findByEmail() │                    │ • getById()                     │ │
│  │ • findById()    │                    │ • create()                      │ │
│  │ • verifyPassword│                    │ • update()                      │ │
│  │ • isAdmin()     │                    │ • delete()                      │ │
│  │ • getStats()    │                    │ • search()                      │ │
│  │                 │                    │ • getStats()                    │ │
│  └─────────────────┘                    └─────────────────────────────────┘ │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                          CAMADA DE VISUALIZAÇÃO                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
│  │  Templates EJS  │  │   Assets CSS    │  │      JavaScript             │ │
│  │                 │  │                 │  │                             │ │
│  │ • layout.ejs    │  │ • Bootstrap 5   │  │ • Validações                │ │
│  │ • login.ejs     │  │ • FontAwesome   │  │ • Interações                │ │
│  │ • dashboard.ejs │  │ • style.css     │  │ • AJAX (futuro)             │ │
│  │ • cars/*.ejs    │  │ • Responsivo    │  │ • Confirmações              │ │
│  │ • error.ejs     │  │                 │  │                             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘ │
│                                                                             │
└─────────────────────────┬───────────────────────────────────────────────────┘
                          │ SQL Queries
                          │ (CREATE, SELECT, UPDATE, DELETE)
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BANCO DE DADOS SQLite                              │
│                            (database.db)                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────────┐  │
│  │          Tabela: users          │  │          Tabela: cars           │  │
│  │                                 │  │                                 │  │
│  │ • id (PK)                       │  │ • id (PK)                       │  │
│  │ • nome                          │  │ • modelo                        │  │
│  │ • email (UNIQUE)                │  │ • fabricante                    │  │
│  │ • senha (hash bcrypt)           │  │ • tipo                          │  │
│  │ • tipo_usuario                  │  │ • marca_modelo                  │  │
│  │ • ativo                         │  │ • ano_fabricacao                │  │
│  │ • created_at                    │  │ • cor                           │  │
│  │ • updated_at                    │  │ • preco                         │  │
│  │                                 │  │ • combustivel                   │  │
│  │                                 │  │ • quilometragem                 │  │
│  │                                 │  │ • observacoes                   │  │
│  │                                 │  │ • created_at                    │  │
│  │                                 │  │ • updated_at                    │  │
│  └─────────────────────────────────┘  └─────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Fluxo de Dados da Aplicação

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   USUÁRIO   │───▶│   BROWSER   │───▶│   SERVER    │───▶│  DATABASE   │
│             │    │             │    │             │    │             │
│ • Admin     │    │ • HTML      │    │ • Express   │    │ • SQLite    │
│ • Viewer    │    │ • CSS       │    │ • EJS       │    │ • users     │
│             │    │ • JavaScript│    │ • bcrypt    │    │ • cars      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       ▲                   ▲                   ▲                   │
       │                   │                   │                   │
       └───────────────────┴───────────────────┴───────────────────┘
                          Resposta HTTP com dados
```

## 🏛️ Padrão de Arquitetura: MVC (Model-View-Controller)

### **📋 MODEL (Modelos)**
```
┌─────────────────────────────────────────┐
│              CAMADA MODEL               │
├─────────────────────────────────────────┤
│                                         │
│  User.js                Car.js          │
│  ├─ Validações          ├─ Validações   │
│  ├─ Criptografia        ├─ CRUD Ops     │
│  ├─ Autenticação        ├─ Busca        │
│  └─ Autorização         └─ Estatísticas │
│                                         │
│  Responsabilidades:                     │
│  • Lógica de negócio                    │
│  • Acesso ao banco de dados             │
│  • Validação de dados                   │
│  • Regras de domínio                    │
└─────────────────────────────────────────┘
```

### **🎮 CONTROLLER (Controladores)**
```
┌─────────────────────────────────────────┐
│            CAMADA CONTROLLER            │
├─────────────────────────────────────────┤
│                                         │
│  authController.js                      │
│  ├─ Login/Logout                        │
│  ├─ Registro                            │
│  └─ Validações                          │
│                                         │
│  carController.js                       │
│  ├─ CRUD de carros                      │
│  ├─ Busca e filtros                     │
│  └─ Paginação                           │
│                                         │
│  dashboardController.js                 │
│  ├─ Estatísticas                        │
│  └─ Dados resumidos                     │
│                                         │
│  Responsabilidades:                     │
│  • Processar requisições HTTP           │
│  • Coordenar Models e Views             │
│  • Tratamento de erros                  │
│  • Redirecionamentos                    │
└─────────────────────────────────────────┘
```

### **👁️ VIEW (Visualizações)**
```
┌─────────────────────────────────────────┐
│              CAMADA VIEW                │
├─────────────────────────────────────────┤
│                                         │
│  Templates EJS:                         │
│  ├─ layout.ejs (base)                   │
│  ├─ auth/ (login, register)             │
│  ├─ dashboard/ (painel principal)       │
│  ├─ cars/ (CRUD de carros)              │
│  └─ error.ejs (tratamento de erros)     │
│                                         │
│  Assets Estáticos:                      │
│  ├─ CSS (Bootstrap + customizado)       │
│  ├─ JavaScript (interações)             │
│  └─ Imagens/Ícones                      │
│                                         │
│  Responsabilidades:                     │
│  • Apresentação dos dados               │
│  • Interface do usuário                 │
│  • Experiência do usuário (UX)          │
│  • Responsividade                       │
└─────────────────────────────────────────┘
```

## 🔐 Fluxo de Autenticação

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   LOGIN     │───▶│  VALIDAÇÃO  │───▶│   SESSÃO    │───▶│  DASHBOARD  │
│             │    │             │    │             │    │             │
│ • Email     │    │ • bcrypt    │    │ • express-  │    │ • Dados     │
│ • Senha     │    │ • Database  │    │   session   │    │ • Permissões│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   ERRO      │    │   ERRO      │    │ MIDDLEWARE  │    │ AUTORIZAÇÃO │
│ • Campos    │    │ • Credenciais│    │ • requireAuth│    │ • Admin     │
│   vazios    │    │   inválidas │    │ • requireAdmin│    │ • Viewer    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## 📊 Características da Arquitetura Monolítica

### **✅ Vantagens Implementadas**
- **Simplicidade**: Uma única aplicação para deploy
- **Desenvolvimento rápido**: Tudo em um lugar
- **Debugging fácil**: Stack trace completo
- **Transações**: ACID garantido pelo SQLite
- **Performance**: Sem latência de rede interna

### **⚠️ Limitações Identificadas**
- **Escalabilidade**: Escala toda a aplicação
- **Tecnologia única**: Node.js para tudo
- **Acoplamento**: Mudanças afetam toda aplicação
- **Deploy**: Toda aplicação para cada mudança

## 🎯 Pontos de Evolução para Microserviços

```
MONÓLITO ATUAL          →          MICROSERVIÇOS FUTUROS
┌─────────────────┐                ┌─────────────────┐
│   UMA APLICAÇÃO │                │  AUTH SERVICE   │
│                 │                ├─────────────────┤
│ • Autenticação  │     ───▶       │  CAR SERVICE    │
│ • Carros        │                ├─────────────────┤
│ • Dashboard     │                │ SEARCH SERVICE  │
│ • Busca         │                ├─────────────────┤
└─────────────────┘                │  API GATEWAY    │
                                   └─────────────────┘
```