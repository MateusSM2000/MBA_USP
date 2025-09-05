# Configuração do provider AWS para LocalStack
# (Pressupõe que o provider "aws" e as variáveis estejam em arquivos separados, ex.: provider.tf e variables.tf)

# Dados locais para configuração
locals {
  common_tags = {                       # Bloco de variáveis locais reutilizáveis
    Environment = var.environment       # Tag do ambiente (dev/qa/prod) vinda de variável
    Project     = "multi-size-ec2"      # Tag fixa com o nome do projeto
    ManagedBy   = "terraform"           # Tag indicando ferramenta de gerenciamento
  }                                     # Fim do mapa common_tags
}                                       # Fim do bloco locals

# VPC
resource "aws_vpc" "main" {             # Declara uma VPC chamada "main"
  cidr_block           = var.vpc_cidr   # Bloco CIDR da VPC (ex.: 10.0.0.0/16)
  enable_dns_hostnames = true           # Habilita hostnames DNS para instâncias
  enable_dns_support   = true           # Habilita resolução DNS dentro da VPC

  tags = merge(local.common_tags, {     # Mescla tags comuns com tags específicas
    Name = "${var.environment}-vpc"     # Nome legível da VPC
  })                                    # Fim do merge de tags
}                                       # Fim do recurso aws_vpc.main

# Internet Gateway
resource "aws_internet_gateway" "main" {# Cria um Internet Gateway associado à VPC
  vpc_id = aws_vpc.main.id              # Liga o IGW à VPC criada acima

  tags = merge(local.common_tags, {     # Aplica tags ao IGW
    Name = "${var.environment}-igw"     # Nome legível do IGW
  })                                    # Fim do merge de tags
}                                       # Fim do recurso aws_internet_gateway.main

# Subnet pública
resource "aws_subnet" "public" {        # Cria subnets públicas
  count = length(var.availability_zones)# Uma subnet por zona de disponibilidade informada

  vpc_id                  = aws_vpc.main.id                          # VPC onde a subnet será criada
  cidr_block              = var.public_subnet_cidrs[count.index]     # CIDR de cada subnet (indexada)
  availability_zone       = var.availability_zones[count.index]      # AZ correspondente à subnet
  map_public_ip_on_launch = true                                      # Atribui IP público automático às instâncias

  tags = merge(local.common_tags, {                                   # Tags da subnet
    Name = "${var.environment}-public-subnet-${count.index + 1}"     # Nome legível com índice humano (1..N)
    Type = "Public"                                                   # Marca como subnet pública
  })                                                                  # Fim do merge de tags
}                                                                     # Fim do recurso aws_subnet.public

# Route Table para subnet pública
resource "aws_route_table" "public" {    # Tabela de rotas para tráfego público
  vpc_id = aws_vpc.main.id               # Associada à mesma VPC

  route {                                # Bloco de rota
    cidr_block = "0.0.0.0/0"             # Rota default para toda a Internet (IPv4)
    gateway_id = aws_internet_gateway.main.id # Próximo salto é o Internet Gateway
  }                                      # Fim do bloco de rota

  tags = merge(local.common_tags, {      # Tags da route table
    Name = "${var.environment}-public-rt"# Nome legível da route table pública
  })                                     # Fim do merge de tags
}                                        # Fim do recurso aws_route_table.public

# Associação da Route Table com as subnets públicas
resource "aws_route_table_association" "public" { # Associa a RT pública a cada subnet pública
  count = length(aws_subnet.public)               # Uma associação por subnet criada

  subnet_id      = aws_subnet.public[count.index].id # Subnet alvo (indexada)
  route_table_id = aws_route_table.public.id         # Route table pública
}                                                   # Fim do recurso aws_route_table_association.public

# Security Group para EC2
resource "aws_security_group" "ec2" {  # Grupo de segurança para instâncias EC2
  name_prefix = "${var.environment}-ec2-sg" # Prefixo do nome (AWS completa com sufixo único)
  vpc_id      = aws_vpc.main.id            # VPC onde o SG será criado

  ingress {                                # Regra de entrada: SSH
    description = "SSH"                    # Descrição da regra
    from_port   = 22                       # Porta inicial (SSH)
    to_port     = 22                       # Porta final (SSH)
    protocol    = "tcp"                    # Protocolo TCP
    cidr_blocks = ["0.0.0.0/0"]            # Aberto para qualquer origem (didático; não recomendado em prod)
  }                                        # Fim da regra de entrada SSH

  ingress {                                # Regra de entrada: HTTP
    description = "HTTP"                   # Descrição da regra
    from_port   = 80                       # Porta 80
    to_port     = 80                       # Porta 80
    protocol    = "tcp"                    # Protocolo TCP
    cidr_blocks = ["0.0.0.0/0"]            # Aberto para Internet
  }                                        # Fim da regra de entrada HTTP

  egress {                                 # Regras de saída (egresso)
    from_port   = 0                        # Qualquer porta
    to_port     = 0                        # Qualquer porta
    protocol    = "-1"                     # Qualquer protocolo
    cidr_blocks = ["0.0.0.0/0"]            # Livre para sair para Internet
  }                                        # Fim da regra de egress

  tags = merge(local.common_tags, {        # Tags do SG
    Name = "${var.environment}-ec2-sg"     # Nome legível do SG
  })                                       # Fim do merge de tags
}                                          # Fim do recurso aws_security_group.ec2

# Instâncias EC2
resource "aws_instance" "web" {            # Declara instâncias EC2 para servidores web
  count = var.ec2_count                    # Quantidade de instâncias a criar

  ami                    = var.ami_id      # AMI a ser utilizada (imagem do SO)
  instance_type          = var.instance_type # Tipo de instância (ex.: t3.micro)
  key_name               = var.key_name    # Par de chaves SSH para acesso
  vpc_security_group_ids = [aws_security_group.ec2.id] # Associa o SG criado
  subnet_id              = aws_subnet.public[count.index % length(aws_subnet.public)].id
  # Seleciona a subnet pública alternando com módulo (%), distribuindo as instâncias entre as subnets

  user_data = base64encode(templatefile("${path.module}/user_data.sh", { # Script de inicialização
    environment    = var.environment         # Passa o ambiente como variável para o template
    instance_index = count.index + 1         # Passa índice humano (1..N) para o template
  }))                                        # Aplica templatefile e codifica em base64 (requerido por alguns providers)

  tags = merge(local.common_tags, {          # Tags das instâncias
    Name = "${var.environment}-web-server-${count.index + 1}" # Nome legível com índice
  })                                         # Fim do merge de tags
}                                            # Fim do recurso aws_instance.web
