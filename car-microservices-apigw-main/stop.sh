#!/bin/bash

echo "🛑 Parando Car Microservices com API Gateway"
echo "============================================"

# Função para parar um serviço
stop_service() {
    local service_name=$1
    local pid_file="logs/${service_name}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo "🔄 Parando $service_name (PID: $pid)..."
            kill $pid
            sleep 2
            if ps -p $pid > /dev/null 2>&1; then
                echo "⚠️ Forçando parada do $service_name..."
                kill -9 $pid
            fi
            echo "✅ $service_name parado"
        else
            echo "⚠️ $service_name já estava parado"
        fi
        rm -f "$pid_file"
    else
        echo "⚠️ PID do $service_name não encontrado"
    fi
}

# Parar serviços na ordem inversa
stop_service "api-gateway"
stop_service "frontend-service"
stop_service "car-service"
stop_service "auth-service"

echo ""
echo "🧹 Limpando processos restantes..."

# Matar qualquer processo restante das portas
for port in 4000 4001 4002 4003; do
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo "🔄 Matando processo na porta $port (PID: $pid)..."
        kill -9 $pid 2>/dev/null
    fi
done

echo ""
echo "🔍 Verificando portas..."
for port in 4000 4001 4002 4003; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️ Porta $port ainda em uso"
    else
        echo "✅ Porta $port liberada"
    fi
done

echo ""
echo "✅ Todos os serviços foram parados!"
echo "📋 Logs mantidos em: logs/"
echo "🚀 Para reiniciar: ./start.sh"
