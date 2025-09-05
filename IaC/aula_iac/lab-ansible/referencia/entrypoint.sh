#!/bin/bash

# Gerar chaves SSH do host se não existirem
if [ ! -f /etc/ssh/ssh_host_rsa_key ]; then
    ssh-keygen -A
fi

# Configurar chaves SSH se existirem
if [ -f /root/.ssh/id_rsa ]; then
    chmod 600 /root/.ssh/id_rsa
fi

if [ -f /root/.ssh/id_rsa.pub ]; then
    chmod 644 /root/.ssh/id_rsa.pub
    cat /root/.ssh/id_rsa.pub >> /root/.ssh/authorized_keys
fi

if [ -f /root/.ssh/authorized_keys ]; then
    chmod 600 /root/.ssh/authorized_keys
fi

# Configurar known_hosts para evitar prompts
if [ ! -f /root/.ssh/known_hosts ]; then
    touch /root/.ssh/known_hosts
    chmod 644 /root/.ssh/known_hosts
fi

# Adicionar hosts conhecidos
ssh-keyscan -H ansible-control >> /root/.ssh/known_hosts 2>/dev/null || true
ssh-keyscan -H target-server >> /root/.ssh/known_hosts 2>/dev/null || true

# Iniciar SSH daemon
/usr/sbin/sshd -D
