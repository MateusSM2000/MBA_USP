#!/bin/bash

echo "🚀 Iniciando Car Microservices com API Gateway"
echo "=============================================="

# Verificar se as portas estão disponíveis
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ Porta $1 está em uso"
        return 1
    else
        echo "✅ Porta $1 disponível"
        return 0
    fi
}

echo "🔍 Verificando portas..."
check_port 4000 || { echo "💡 Execute ./stop.sh primeiro"; exit 1; }
check_port 4001 || { echo "💡 Execute ./stop.sh primeiro"; exit 1; }
check_port 4002 || { echo "💡 Execute ./stop.sh primeiro"; exit 1; }
check_port 4003 || { echo "💡 Execute ./stop.sh primeiro"; exit 1; }

echo ""
echo "📦 Verificando dependências..."

# Instalar dependências se necessário
for service in auth-service car-service frontend-service api-gateway; do
    if [ ! -d "$service/node_modules" ]; then
        echo "📦 Instalando dependências do $service..."
        cd $service && npm install && cd ..
    fi
done

echo ""
echo "🚀 Iniciando serviços..."

# Criar diretório de logs
mkdir -p logs

# Iniciar Auth Service
echo "🔐 Iniciando Auth Service (porta 4001)..."
cd auth-service && nohup npm start > ../logs/auth-service.log 2>&1 & echo $! > ../logs/auth-service.pid && cd ..

# Aguardar um pouco
sleep 2

# Iniciar Car Service
echo "🚗 Iniciando Car Service (porta 4002)..."
cd car-service && nohup npm start > ../logs/car-service.log 2>&1 & echo $! > ../logs/car-service.pid && cd ..

# Aguardar um pouco
sleep 2

# Iniciar Frontend Service
echo "🌐 Iniciando Frontend Service (porta 4003)..."
cd frontend-service && nohup npm start > ../logs/frontend-service.log 2>&1 & echo $! > ../logs/frontend-service.pid && cd ..

# Aguardar um pouco
sleep 2

# Iniciar API Gateway
echo "🚪 Iniciando API Gateway (porta 4000)..."
cd api-gateway && npm install > /dev/null 2>&1 && nohup npm start > ../logs/api-gateway.log 2>&1 & echo $! > ../logs/api-gateway.pid && cd ..

# Aguardar serviços iniciarem
echo ""
echo "🔍 Verificando serviços..."
sleep 5

# Verificar se os serviços estão rodando
check_service() {
    local service_name=$1
    local port=$2
    local pid_file="logs/${service_name}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo "✅ $service_name (PID: $pid, Porta: $port)"
            return 0
        else
            echo "❌ $service_name falhou ao iniciar"
            return 1
        fi
    else
        echo "❌ $service_name não foi iniciado"
        return 1
    fi
}

check_service "Auth Service" 4001
check_service "Car Service" 4002
check_service "Frontend Service" 4003
check_service "API Gateway" 4000

echo ""
echo "🎉 Todos os serviços iniciados com sucesso!"
echo ""
echo "📋 Informações de Acesso:"
echo "🚪 API Gateway (Ponto único): http://localhost:4000"
echo "🔐 Auth Service: http://localhost:4001/health"
echo "🚗 Car Service: http://localhost:4002/health"
echo "🌐 Frontend Service: http://localhost:4003/health"
echo ""
echo "🛡️ Recursos do API Gateway:"
echo "   ✅ Rate limiting (1000 req/15min)"
echo "   ✅ Authentication middleware"
echo "   ✅ Request logging"
echo "   ✅ Service health checks"
echo "   ✅ Error handling"
echo ""
echo "👤 Usuários de Teste:"
echo "📧 Admin: admin@carros.com / admin123"
echo "📧 User:  user@carros.com / user123"
echo ""
echo "📊 Logs: tail -f logs/[service-name].log"
echo "🛑 Parar: ./stop.sh"
