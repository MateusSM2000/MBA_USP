# Terraform Multi-Environment com AWS LocalStack

Este exemplo demonstra como usar Terraform para criar infraestrutura em múltiplos ambientes (DEV, QA, PROD) com diferentes configurações e quantidades de recursos.


## Configuração dos Ambientes

### Ambiente DEV
- VPC: 10.0.0.0/16
- Instâncias EC2: 2 (t2.micro)
- Availability Zones: us-east-1a, us-east-1b
- Subnets: 2 públicas

### Ambiente QA
- VPC: 10.1.0.0/16
- Instâncias EC2: 2 (t2.small)
- Availability Zones: us-east-1a, us-east-1b
- Subnets: 2 públicas

### Ambiente PROD
- VPC: 10.2.0.0/16
- Instâncias EC2: 4 (t2.medium)
- Availability Zones: us-east-1a, us-east-1b, us-east-1c, us-east-1d
- Subnets: 4 públicas


### Ir para o diretório do exemplo

```bash
cd multi-size-ec2
```

###  Executar os Ambientes


Para executar um ambiente específico manualmente:

```bash
# Inicializar Terraform
terraform init

# Executar ambiente DEV
terraform plan -var-file="dev.tfvars -out=dev_tfplan"
terraform apply "dev_tfplan" 

# Executar ambiente QA
terraform plan -var-file="qa.tfvars"
terraform apply "qa.tfvars"

# Executar ambiente PROD
terraform plan -var-file="prod.tfvars"
terraform apply "prod.tfvars"
```

### Verificar os Recursos Criados

#### Testar Servidores Web

Após a criação das instâncias, você pode testar os servidores web:

```bash
# Obter IPs das instâncias
terraform output ec2_public_ips

```

### Ver Outputs dos Recursos

Para ver informações detalhadas dos recursos criados:

```bash
terraform output
```
## Comandos Úteis

### Terraform

```bash
# Ver estado atual
terraform show

# Ver outputs
terraform output

# Formatar código
terraform fmt

# Validar configuração
terraform validate


```

## Limpeza dos Recursos


### Manual

```bash
# Destruir ambiente específico
terraform destroy -var-file="dev.tfvars" -auto-approve
terraform destroy -var-file="qa.tfvars" -auto-approve
terraform destroy -var-file="prod.tfvars" -auto-approve
```

### Parar LocalStack

```bash
cd ..
docker compose down
```

