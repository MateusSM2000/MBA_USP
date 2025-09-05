# Laboratório Terraform com AWS LocalStack

## Instalação e Execução

### Iniciar LocalStack

```bash
# Iniciar LocalStack em background
docker compose up -d --build

docker compose exec terraform sh
```

### Executar Exemplo 1

```bash
# Navegar para o diretório do projeto
cd exemplo1-s3

terraform  init
terraform  plan  -out=plan_exemplo1_s3 
terraform  apply  plan_exemplo1_s3
cd ..
```

### Executar Exemplo 2

```bash
# Navegar para o diretório do projeto
cd exemplo2-ec2

terraform  init
terraform  plan -out=plan_exemplo2_ec2
terraform  apply plan_exemplo2_ec2
cd ..
```

### Executar Exemplo 3

```bash
# Navegar para o diretório do projeto
cd exemplo3-sqs

terraform  init
terraform  plan  -out=plan_exemplo3_sqs
terraform  apply plan_exemplo3_sqs
cd ..
```
### Limpeza do ambiente

Para destruir todos os recursos criados:

```bash
cd exemplo1-s3
docker compose down --volumes --rmi all
cd ..

cd exemplo2-ec2
docker compose down --volumes --rmi all
cd ..

cd exemplo1-s3
docker compose down --volumes --rmi all
cd ..

cd multi-size-ec2/
docker compose down --volumes --rmi all
cd ..

```
