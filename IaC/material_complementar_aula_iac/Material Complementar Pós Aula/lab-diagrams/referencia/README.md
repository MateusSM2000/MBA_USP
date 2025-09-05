# Laboratório de Diagramas com Python

Este projeto demonstra como criar diagramas de arquitetura usando a biblioteca `diagrams` do Python em um ambiente Docker.

## Como usar

### Construir e iniciar o ambiente

```bash
docker compose up -d --build
```


### Exemplos

**Exemplo 1 - Arquitetura Web Simples:**
```bash
cat src/exemplo1_web_architecture.py
```

**Exemplo 2 - Pipeline CI/CD:**
```bash
cat src/exemplo2_microservices.py
```

**Exemplo 3 - Arquitetura de Microserviços:**
```bash
cat src/exemplo3_microservices.py
```

**Exemplo 4 - Pipeline de Dados:**
```bash
cat src/exemplo4_data_pipeline.py
```

**Exemplo 5 - C4 Diagram:**
```bash
cat src/exemplo_C4-Internet_Banking.py
```



### Executar os exemplos

**Exemplo 1 - Arquitetura Web Simples:**
```bash
docker compose exec diagrams-lab python src/exemplo1_web_architecture.py
```

**Exemplo 2 - Pipeline CI/CD:**
```bash
docker compose exec diagrams-lab python src/exemplo2_microservices.py
```

**Exemplo 3 - Arquitetura de Microserviços:**
```bash
docker compose exec diagrams-lab python src/exemplo3_microservices.py
```

**Exemplo 4 - Pipeline de Dados:**
```bash
docker compose exec diagrams-lab python src/exemplo4_data_pipeline.py
```

**Exemplo 4 - Diagrama C4:**
```bash
docker compose exec diagrams-lab python src/exemplo_C4-Internet_Banking.py

```

### 3. Visualizar os diagramas

Os diagramas serão gerados na pasta `output/` em formato PNG.

#### Verificar se os arquivos foram gerados:
```bash
# Listar arquivos gerados
ls -la output/

```

#### Arquivos de saída esperados:
- `output/web_architecture.png` - Diagrama da arquitetura web simples
- `output/02-microservices.py.png` - Diagrama do pipeline CI/CD
- `output/03-microservices.png` - Diagrama da arquitetura de microserviços
- `output/data_pipeline.png` - Diagrama do pipeline de dados
- `output/data_pipeline.png` - Diagrama Internet Banking

## Limpeza do ambiente

Para parar e remover os containers:

```bash
docker compose down
```

Para remover também as imagens:

```bash
docker compose down --rmi all
```

