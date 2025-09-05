#!/bin/bash

# Removendo  diretório para chaves SSH
rm -rf  ./ssh_keys

# Criar diretório para chaves SSH
mkdir -p ssh_keys

# Gerar par de chaves SSH se não existir
if [ ! -f ssh_keys/id_rsa ]; then
    echo "Gerando chaves SSH..."
    ssh-keygen -t rsa -b 4096 -f ssh_keys/id_rsa -N "" -C "ansible@test"
    
    # Criar arquivo authorized_keys
    cp ssh_keys/id_rsa.pub ssh_keys/authorized_keys
    
    # Definir permissões corretas
    chown -R $USER:$USER
    chmod 600 ssh_keys/id_rsa
    chmod 644 ssh_keys/id_rsa.pub
    chmod 600 ssh_keys/authorized_keys
    
    echo "Chaves SSH criadas com sucesso!"
else
    echo "Chaves SSH já existem."
fi



echo "Setup concluído!"
echo ""
echo "Para usar:"
echo "2. Execute: docker-compose up -d"
echo "3. Teste SSH: docker exec -it ansible-control ssh root@target-server"
