# Lab Ansible - Exemplos Práticos

Este laboratório contém 4 exemplos práticos de uso do Ansible com Docker Compose para automação de tarefas Linux.

## Configuração Inicial

### Iniciar o ambiente

```bash
# Criando chaves SSH (Linux/Mac)
./setup-ssh.sh
```

💡 Observação importante:
Em alguns ambientes (principalmente no Windows com PowerShell), pode ser necessário:

Executar o terminal em modo Administrador para rodar o script .ps1.

Ajustar permissões dentro do container para que o Ansible consiga acessar os arquivos:

```bash

# Adicionando as permissões

chmod 755 /ansible
chmod 644 /ansible/*

# Criando chaves SSH (Windows)
.\setup-ssh.ps1
```

```bash
# Subir os containers
docker compose up -d --build
```

# Verificar se os containers estão rodando

```bash
docker compose ps
```

### 2. Acessar o container de controle do Ansible

```bash
docker compose  exec  ansible-control bash
bash-5.1#
```

### 3. Testar conectividade com o servidor alvo

```bash
# Dentro do container ansible-control
cd ansible
ansible all -m ping
```

## Exemplos de Playbooks

### Exemplo 1: Instalação de Pacotes

**Objetivo:** Instalar pacotes essenciais no servidor usando comandos Linux.

**Comando para executar:**

```bash
# Dentro do container ansible-control
ansible-playbook 01-install-packages.yml
```

### Exemplo 2: Gerenciamento de Diretórios e Permissões

**Objetivo:** Criar diretórios com permissões específicas e gerenciar arquivos.

**Comando para executar:**

```bash
# Dentro do container ansible-control
ansible-playbook 02-manage-directories.yml
```

### Exemplo 3: Instalação e Configuração do Nginx

**Objetivo:** Instalar Nginx e configurar um site básico.

**Comando para executar:**

```bash
# Dentro do container ansible-control
ansible-playbook 03-install-nginx.yml
```

### Exemplo 4: Gerenciamento Avançado da Página Nginx

**Objetivo:** Gerenciar conteúdo da página web com templates e backups.

**Comando para executar:**

```bash
# Dentro do container ansible-control
ansible-playbook 04-manage-nginx-site.yml
```

### Executar playbooks com verbosidade

```bash
# Modo verbose
ansible-playbook 01-install-packages.yml -v

# Modo muito verbose
ansible-playbook 01-install-packages.yml -vv

# Debug completo
ansible-playbook 01-install-packages.yml -vvv
```

### Executar apenas tarefas específicas

```bash
# Executar apenas uma tarefa específica
ansible-playbook 03-install-nginx.yml --tags "install"

# Pular tarefas específicas
ansible-playbook 03-install-nginx.yml --skip-tags "test"
```

## Limpeza do Ambiente

### Parar e remover containers

```bash
docker compose down

# Remover volumes também
docker compose down -v
```

### Remover imagens (opcional)

```bash
docker compose down --volumes --rmi all
```
