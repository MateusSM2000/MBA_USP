# Exemplo 7 - SQS (Simple Queue Service)

Este exemplo cria três filas SQS no LocalStack:
- Topico1
- Topico2  
- Topico3

## Recursos Criados

- 3 filas SQS com configurações padrão
- Tags para identificação
- Outputs com URLs e ARNs das filas

## Como Executar

1. Certifique-se que o LocalStack está rodando:
```bash
docker-compose up -d
```

2. Execute o Terraform:
```bash
cd exemplo7-sqs
terraform init
terraform plan
terraform apply
```

3. Veja os outputs:
```bash
terraform output
```

## Como Testar

### Listar filas criadas:
```bash
aws --endpoint-url=http://localhost:4566 sqs list-queues
```

### Enviar mensagem para uma fila:
```bash
aws --endpoint-url=http://localhost:4566 sqs send-message \
  --queue-url http://localhost:4566/000000000000/Topico1 \
  --message-body "Mensagem de teste para Topico1"
```

### Receber mensagens de uma fila:
```bash
aws --endpoint-url=http://localhost:4566 sqs receive-message \
  --queue-url http://localhost:4566/000000000000/Topico1
```

### Ver atributos de uma fila:
```bash
aws --endpoint-url=http://localhost:4566 sqs get-queue-attributes \
  --queue-url http://localhost:4566/000000000000/Topico1 \
  --attribute-names All
```

## Limpeza

Para destruir os recursos:
```bash
terraform destroy -auto-approve
```
