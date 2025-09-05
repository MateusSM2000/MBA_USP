FROM python:3.11-slim

# Instalar dependências do sistema necessárias para Graphviz
RUN apt-get update && apt-get install -y \
    graphviz \
    && rm -rf /var/lib/apt/lists/*

# Definir diretório de trabalho
WORKDIR /app

# Copiar requirements e instalar dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Criar diretórios
RUN mkdir -p /app/src /app/output

# Comando padrão
CMD ["python"]
